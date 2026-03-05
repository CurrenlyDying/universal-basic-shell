# UBS — Universal Basic Shell

UBS is a privacy routing system that keeps a stable Cloudflare Worker front door while switching execution tiers behind it.

## Start here: complete setup guide

If you want the full setup from scratch (Apps Script URL, Cloud Run, Cloudflare Worker, Colab worker node, and GitHub Pages), use:

- **`docs/setup-from-zero.md`**

## GitHub Pages portal

This repository works as a navigable GitHub Pages site from repo root (`index.html`).

### What you can do on the site
- Understand architecture and setup in one place.
- Use embedded **PWA Generator** (`generator/public/index.html`).
- Use embedded **Universal PWA Shell** (`pwa/public/index.html`).
- Run operator checks (`/health`, `/signal/nodes`).
- Trigger Tier 1 session start through Cloudflare Worker.
- Load and inspect recipe examples.

## Architecture (updated)

- **Tier 0**: Apps Script proxy (Google infra fetch)
- **Tier 1**:
  - **Cloud Run = signaling server (operator)**
  - **Cloud Shell/Colab = browser worker node (browser runtime)**
- **Tier 2**: WireGuard/Headscale mesh
- **Tier 3**: Volunteer residential peers

## Quick links

- Full step-by-step: `docs/setup-from-zero.md`
- User instructions: `docs/user-guide.md`
- Cloud Run + Colab tutorial: `docs/tutorial-cloudrun-colab.md`
- Build handoff: `HANDOFF.md`

## Worker routing behavior

- `?tier=0` -> Apps Script proxy.
- `?tier=1` -> Cloud Run signal `/session/start`.
- `?recipe=` loads recipe from registry and selects default tier.

## Current status

This repo is a practical scaffold with a working portal and operator/user docs, ready for hardening (auth, durable signaling state, websocket streaming, and vault persistence).
