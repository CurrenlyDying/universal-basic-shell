# UBS User Guide

## Start here (GitHub Pages)

Open the repository GitHub Pages URL (or local `index.html`) to access the unified UBS portal.
From the portal tabs, you can navigate architecture notes, generator tools, universal shell, operator checks, and recipes.

## 1) Casual user (fast path)
1. Open the UBS portal and go to **PWA Generator**.
2. Paste your target site URL.
3. Click **Analyze**.
4. Click **Generate PWA Files** and deploy/install the PWA.
5. Open the PWA and browse through UBS.

## 2) Power user
1. Complete fast path.
2. Set preferred region in generator/PWA settings.
3. Use Tier 1 for SPA/WebSocket-heavy apps.
4. Run your own worker node from Colab or Cloud Shell for better control.
5. Use the portal's **Operator Tools** tab to check signaling node health.

## 3) What happens behind the scenes
- Cloudflare Worker is your stable entrypoint.
- Tier 0 calls Apps Script proxy from Google infra.
- Tier 1 sends a session start to Cloud Run signaling.
- Cloud Run signaling assigns a live browser worker node.
- Browser worker node (Colab/Cloud Shell) executes page actions.
