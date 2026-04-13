// api/bookings.js — Vercel serverless function
import { Redis } from "@upstash/redis";
const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const TIME_SLOTS = [
  "12:15 PM – 12:25 PM",
  "12:30 PM – 12:40 PM",
  "12:45 PM – 12:55 PM",
  "1:40 PM – 1:50 PM",
  "1:55 PM – 2:05 PM",
  "2:10 PM – 2:20 PM",
];
const SLOT_COUNT = 4;
const BOOKINGS_KEY = "cf-bookings";
const PRESENCE_KEY = "cf-presence";
const PRESENCE_TTL = 60; // seconds before a presence entry auto-expires

function emptyBookings() {
  const b = {};
  TIME_SLOTS.forEach((t) => {
    for (let s = 1; s <= SLOT_COUNT; s++) b[`${t}|${s}`] = null;
  });
  return b;
}

async function getBookings() {
  const data = await kv.get(BOOKINGS_KEY);
  return data || emptyBookings();
}

// Presence: { [slotKey]: { [sessionId]: timestamp } }
async function getPresence() {
  const data = await kv.get(PRESENCE_KEY);
  return data || {};
}

function cleanPresence(presence) {
  const now = Date.now();
  const cleaned = {};
  for (const [slot, sessions] of Object.entries(presence)) {
    const activeSessions = {};
    for (const [sid, ts] of Object.entries(sessions)) {
      if (now - ts < PRESENCE_TTL * 1000) activeSessions[sid] = ts;
    }
    if (Object.keys(activeSessions).length > 0) cleaned[slot] = activeSessions;
  }
  return cleaned;
}

// Returns { [slotKey]: count } for slots with viewers
function presenceCounts(presence, excludeSession = null) {
  const counts = {};
  for (const [slot, sessions] of Object.entries(presence)) {
    const filtered = excludeSession
      ? Object.keys(sessions).filter((s) => s !== excludeSession)
      : Object.keys(sessions);
    if (filtered.length > 0) counts[slot] = filtered.length;
  }
  return counts;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET — return bookings + presence counts (excluding caller's own session)
  if (req.method === "GET") {
    const { session } = req.query;
    const [bookings, presence] = await Promise.all([getBookings(), getPresence()]);
    const cleaned = cleanPresence(presence);
    return res.status(200).json({
      bookings,
      watching: presenceCounts(cleaned, session),
    });
  }

  // POST — book a slot OR update presence
  if (req.method === "POST") {
    const { action, slotKey, teamName, sessionId } = req.body;

    // ── Presence update ──
    if (action === "presence") {
      if (!sessionId) return res.status(400).json({ error: "Missing sessionId." });
      const presence = await getPresence();
      const cleaned = cleanPresence(presence);

      // Remove this session from all slots first
      for (const slot of Object.keys(cleaned)) {
        delete cleaned[slot]?.[sessionId];
        if (cleaned[slot] && Object.keys(cleaned[slot]).length === 0) delete cleaned[slot];
      }

      // Add to new slot if provided
      if (slotKey) {
        if (!cleaned[slotKey]) cleaned[slotKey] = {};
        cleaned[slotKey][sessionId] = Date.now();
      }

      await kv.set(PRESENCE_KEY, cleaned, { ex: PRESENCE_TTL + 10 });
      return res.status(200).json({ success: true });
    }

    // ── Book a slot ──
    if (action === "book") {
      if (!slotKey || !teamName)
        return res.status(400).json({ error: "Missing slotKey or teamName." });

      const [time, slot] = slotKey.split("|");
      if (!TIME_SLOTS.includes(time) || !["1","2","3","4"].includes(slot))
        return res.status(400).json({ error: "Invalid slot." });

      const bookings = await getBookings();
      if (bookings[slotKey])
        return res.status(409).json({ error: "Slot already booked." });

      bookings[slotKey] = teamName.trim();
      await kv.set(BOOKINGS_KEY, bookings);

      // Clear presence for this slot
      const presence = await getPresence();
      const cleaned = cleanPresence(presence);
      delete cleaned[slotKey];
      await kv.set(PRESENCE_KEY, cleaned);

      return res.status(200).json({ success: true, bookings });
    }

    return res.status(400).json({ error: "Unknown action." });
  }

  // DELETE — reset all bookings and presence
  if (req.method === "DELETE") {
    await Promise.all([
      kv.set(BOOKINGS_KEY, emptyBookings()),
      kv.set(PRESENCE_KEY, {}),
    ]);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed." });
}
