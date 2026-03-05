# UBS — Universal Basic Shell

UBS is a privacy routing system that keeps a stable Cloudflare Worker front door while switching execution tiers behind it.

## GitHub Pages portal

This repository now works as a navigable GitHub Pages site from the repo root (`index.html`).

### What you can do on the site

- Understand architecture and setup in one place.
- Use the embedded **PWA Generator** (`generator/public/index.html`).
- Use the embedded **Universal PWA Shell** (`pwa/public/index.html`).
- Run operator checks against your Cloud Run signaling server (`/health`, `/signal/nodes`).
- Trigger Tier 1 session start through your Cloudflare Worker.
- Load and inspect local recipe examples.

To enable GitHub Pages, set Pages source to this branch/root and open the published URL.

## Architecture (updated)

- **Tier 0**: Apps Script proxy (Google infra fetch)
- **Tier 1**:
  - **Cloud Run = signaling server (operator)**
  - **Cloud Shell/Colab = browser worker node (browser runtime)**
- **Tier 2**: WireGuard/Headscale mesh
- **Tier 3**: Volunteer residential peers

## Why this shift matters

Cloud Run stays stateless and instant (session handshake + routing only), while browser state and heavy execution live in disposable worker runtimes that connect outward to the signal server.

## Quick start

1. Deploy Apps Script from `apps-script/`.
2. Deploy Cloud Run signaling server from `container/`.
3. Configure and deploy Cloudflare Worker from `worker/`.
4. Start a worker node with `colab/default.ipynb` (or Cloud Shell equivalent).
5. Open repo-root `index.html` (or GitHub Pages URL) to use all user/operator flows.

## User docs

- User instructions: `docs/user-guide.md`
- Operator tutorial: `docs/tutorial-cloudrun-colab.md`
- Build handoff: `HANDOFF.md`

## Worker routing behavior

- `?tier=0` -> Apps Script proxy.
- `?tier=1` -> Cloud Run signal `/session/start`.
- `?recipe=` loads recipe from registry and selects default tier.

## Current status

This repo is a practical scaffold. It includes the architecture-shifted control plane and tutorials, ready for hardening (auth, durable signaling state, websocket streaming, and vault persistence).
