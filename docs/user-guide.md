# UBS User Guide

## 1) Casual user (fast path)
1. Open the UBS Generator page.
2. Paste your target site URL.
3. Click **Analyze**.
4. Click **Generate PWA Files** and deploy/install the PWA.
5. Open the PWA and browse through UBS.

## 2) Power user
1. Complete fast path.
2. Set preferred region in generator/PWA settings.
3. Use Tier 1 for SPA/WebSocket-heavy apps.
4. Run your own worker node from Colab or Cloud Shell for better control.

## 3) What happens behind the scenes
- Cloudflare Worker is your stable entrypoint.
- Tier 0 calls Apps Script proxy from Google infra.
- Tier 1 sends a session start to Cloud Run signaling.
- Cloud Run signaling assigns a live browser worker node.
- Browser worker node (Colab/Cloud Shell) executes page actions.
