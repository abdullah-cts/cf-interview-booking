# Critical Friend – Interview Booking System

A premium, real-time web application for teams to book 10-minute interview slots. Built for speed, clarity, and multi-user awareness.

---

## ✨ Key Features

- **Presence Awareness** — Real-time 👀 "Someone looking" indicators. When a user selects a slot, other users see an amber warning badge instantly, preventing double-booking attempts before they happen.
- **Multi-Location Support** — Supports multiple concurrent interviews across four distinct locations:
  - **2A**
  - **Outside the Fab Lab**
  - **Robotics Lab / Forum**
  - **Digi Lab**
- **Smart Team Validation** — Enforces a "One Booking Per Team" rule with advanced name normalization (ignores case differences and extra internal whitespace) to ensure fair access for everyone.
- **Admin Management** — Secure administrative controls to manage the schedule:
  - **Individual Deletion**: Admins can remove specific bookings via a password-protected modal on the View page.
  - **Global Reset**: Ability to clear the entire schedule for a new round of interviews.
- **Live Updates** — The View page automatically refreshes every 5 seconds to show the latest confirmed bookings.

---

## 🛠️ Project Structure

```
cf-booking/
├── api/
│   └── bookings.js       ← Serverless API (GET / POST / DELETE)
├── public/
│   └── index.html        ← Frontend (Booking + View pages)
├── package.json
├── vercel.json
└── .gitignore
```

---

## 🚀 Deployment (Vercel + Upstash)

### 1. Create a GitHub Repository
1. Create a new repo named `cf-interview-booking`.
2. Push the code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/cf-interview-booking.git
   git push -u origin main
   ```

### 2. Import to Vercel
1. Go to [Vercel](https://vercel.com) → **Add New Project** → Import your repo.
2. **Environment Variables**: Add `ADMIN_PASSWORD` (used for deleting/resetting bookings).
3. Click **Deploy**.

### 3. Add Vercel KV (Upstash Redis)
1. In your Vercel project dashboard, go to the **Storage** tab.
2. Click **Create Database** → **KV** → Name it `cf-bookings-kv`.
3. Click **Connect** to link it to your project.
4. **Redeploy** the project to pick up the new KV environment variables.

---

## 🔐 Administrative Actions

### Delete a Single Booking
1. Navigate to the **View All Bookings** page.
2. Click the three-dot menu (⋮) on the booking card you wish to remove.
3. Enter the `ADMIN_PASSWORD` and confirm.

### Reset All Bookings
Run this in your browser console (F12) while on the app URL:
```javascript
fetch('/api/bookings', { 
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'YOUR_ADMIN_PASSWORD' })
}).then(r => r.json()).then(console.log)
```

---

## 📅 Slot Reference

The system supports **24 total slots** across 6 time blocks and 4 locations.

| Time Block | 2A | Outside Fab Lab | Robotics Lab | Digi Lab |
| :--- | :---: | :---: | :---: | :---: |
| **12:15 – 12:25** | ✅ | ✅ | ✅ | ✅ |
| **12:30 – 12:40** | ✅ | ✅ | ✅ | ✅ |
| **12:45 – 12:55** | ✅ | ✅ | ✅ | ✅ |
| **1:40 – 1:50** | ✅ | ✅ | ✅ | ✅ |
| **1:55 – 2:05** | ✅ | ✅ | ✅ | ✅ |
| **2:10 – 2:20** | ✅ | ✅ | ✅ | ✅ |
