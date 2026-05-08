import { Redis } from "@upstash/redis";
const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const password = req.headers.authorization || req.query.password;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Forbidden." });
    }

    try {
      const LOGS_KEY = "cf-logs";
      // Perform cleanup before fetching
      const timestamp = Date.now();
      const oneWeekAgo = timestamp - 7 * 24 * 60 * 60 * 1000;
      await kv.zremrangebyscore(LOGS_KEY, "-inf", oneWeekAgo);

      // Fetch logs (descending order, newest first)
      const logs = await kv.zrange(LOGS_KEY, 0, -1, { rev: true });
      
      return res.status(200).json({ success: true, logs });
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      return res.status(500).json({ error: "Failed to fetch logs." });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
}
