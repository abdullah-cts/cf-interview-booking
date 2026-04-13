# Critical Friend – Interview Booking System v2

A simple web app for teams to book 10-minute interview slots, with live
"someone is looking" presence indicators for multi-user awareness.

---

## What's New in v2

- **Presence awareness** — when a user selects a slot (without booking),
  other users see a 👀 "X looking" warning badge on that slot in amber.
- Presence clears automatically when the user deselects, navigates away,
  or closes the tab (`beforeunload` + `sendBeacon`).
- 60-second server-side TTL as a safety net (in case the browser crashes).

---

## Project Structure

```
cf-booking/
├── api/
│   └── bookings.js       ← Serverless API (GET / POST / DELETE)
├── public/
│   └── index.html        ← Frontend (booking + view pages)
├── package.json
├── vercel.json
└── .gitignore
```

---

## Deploy to Vercel (Step-by-Step)

### Step 1 — Create a GitHub repository

1. Go to https://github.com and sign in (or create a free account).
2. Click **New repository** → name it `cf-interview-booking`.
3. Click **Create repository**.
4. Upload all files (keeping folder structure) via the GitHub web UI,
   or use Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/cf-interview-booking.git
   git push -u origin main
   ```

### Step 2 — Import to Vercel

1. Go to https://vercel.com → **Sign Up** → **Continue with GitHub**.
2. Click **Add New… → Project** → find your repo → **Import**.
3. Leave all settings as default → **Deploy**.

### Step 3 — Add Vercel KV (free database)

1. In your Vercel project dashboard → **Storage** tab.
2. Click **Create Database** → **KV** → name it `cf-bookings-kv` → **Hobby** plan.
3. Click **Create & Continue** → **Connect** to link it to your project.
   Vercel automatically adds the required environment variables.

### Step 4 — Redeploy

1. Go to **Deployments** tab → click **⋯** next to latest → **Redeploy**.
2. Wait ~30 seconds.

### Step 5 — Done! 🎉

Your app is live at `https://cf-interview-booking.vercel.app`.
Share the URL with your teams.

---

## Resetting All Bookings

```bash
curl -X DELETE https://your-app.vercel.app/api/bookings
```

Or in browser console (F12):
```javascript
fetch('/api/bookings', { method: 'DELETE' }).then(r => r.json()).then(console.log)
```

---

## Slot Reference

| Time          | Capacity |
|---------------|----------|
| 12:15 – 12:25 | 4 slots  |
| 12:30 – 12:40 | 4 slots  |
| 12:45 – 12:55 | 4 slots  |
| 1:40 – 1:50   | 4 slots  |
| 1:55 – 2:05   | 4 slots  |
| 2:10 – 2:20   | 4 slots  |

**Total capacity: 24 bookings · Location: Back of 2A**
