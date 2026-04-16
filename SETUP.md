# Still Point — Setup Guide

## What you have

```
index.html    — the main PWA app (voice logging)
portal.html   — backend portal (review logs, export CSV)
manifest.json — PWA install config
sw.js         — service worker (offline support)
setup.sql     — Supabase database setup
SETUP.md      — this file
```

---

## Step 1 — Supabase

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Paste the entire contents of `setup.sql` and click **Run**
4. Go to **Authentication > Users** and create your account (or use the Sign Up flow)
5. Copy your **Project URL** and **anon public key** from **Settings > API**

---

## Step 2 — API Keys

You need three API keys. Open both `index.html` and `portal.html`
and update the `CONFIG` block at the top of each file:

```javascript
const CONFIG = {
    ANTHROPIC_API_KEY : 'sk-ant-...',    // from console.anthropic.com
    OPENAI_API_KEY    : 'sk-...',        // from platform.openai.com
    SUPABASE_URL      : 'https://xxx.supabase.co',
    SUPABASE_ANON_KEY : 'eyJ...',
};
```

The portal only needs `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

---

## Step 3 — App Icon (optional but recommended for iOS PWA)

Create two PNG icons:
- `icon.png` — 192×192 pixels
- `icon-512.png` — 512×512 pixels

Dark background (#080808), simple mark. Place them in the root folder.

---

## Step 4 — Deploy to Netlify

1. Push all files to a GitHub repo
2. Connect the repo to Netlify
3. Deploy — no build step needed (static files)
4. Your app is live at `your-site.netlify.app`

---

## Step 5 — Install on iPhone

1. Open the app URL in Safari on your iPhone
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add**

The app now lives on your home screen like a native app.
Tap it — no browser chrome, full screen, dark.

---

## Step 6 — First Use

1. Open the app
2. Log in with your Supabase credentials
3. Tap the mic button
4. Say where you are (e.g. "just woke up" or "post meal")
5. Listen to the practice text
6. Answer questions naturally
7. Say "next" when ready to move to the next question
   (Tap the mic button as fallback if speech recognition doesn't catch it)
8. Say "done" or wait — the app completes the session
9. Your log is saved

---

## Portal Access

Go to `your-site.netlify.app/portal.html` in a desktop browser.
Log in with the same credentials.
Filter by threshold type and date range.
Export CSV for monthly Polar data analysis.

---

## Notes

- The app stores only the **summary**, not the full conversation
- Each session summary is a JSON object stored in Supabase
- The coaching note before training pulls from your recent post-training logs
- Weekly sitting is marked supplemental if it's not a Sunday
- All API calls happen directly from your browser (personal use only)

---

## Phase 2 reminders (for later)

- [ ] Move API keys to environment variables / Netlify Functions
- [ ] Build settings panel for prompt editing
- [ ] Add configurable system prompt tuning (Coach Calibration)
- [ ] Add macro summary at meal 3
- [ ] Add animated character / glow state polish
- [ ] Add session resume for interrupted logs
- [ ] Add Polar data integration to portal
