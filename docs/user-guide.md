# UBS User Guide

## Start here (GitHub Pages)

Open the GitHub Pages URL (or local `index.html`) to access the unified UBS portal.
If you need full first-time setup for all infrastructure, read `docs/setup-from-zero.md` first.

## 1) Casual user (fast path)
1. Open the UBS portal and go to **PWA Generator**.
2. Paste target site URL.
3. Click **Analyze**.
4. Click **Generate PWA Files**.
5. Install/run the generated PWA.

## 2) Power user
1. Complete fast path.
2. Set preferred region in generator/PWA settings.
3. Use Tier 1 for SPA/WebSocket-heavy apps.
4. Run your own worker node from Colab or Cloud Shell for control.
5. Use **Operator Tools** to check signal health and active nodes.

## 3) Behind the scenes
- Cloudflare Worker is stable front door.
- Tier 0 calls Apps Script proxy from Google infra.
- Tier 1 calls Cloud Run signaling.
- Signaling assigns a live browser worker node.
- Worker node executes page actions.
