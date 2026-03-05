# UBS — Universal Basic Shell

UBS is a privacy routing system that keeps a stable Cloudflare Worker front door while switching execution tiers behind it.

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
5. Use `generator/public/index.html` to create route configs.

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
