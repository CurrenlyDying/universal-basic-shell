# UBS — Universal Basic Shell
## Agent Handoff Document — Updated Build Specification

## Critical architecture shift

- **Cloud Run** is now the **signaling server/operator plane**.
  - Stateless.
  - Handles session start handshake, assignment, and node selection.
- **Cloud Shell / Colab** is now the **worker node/browser plane**.
  - Stateful browser runtime.
  - Connects out to signaling server and announces readiness.

## Delivered modules (updated)

1. `worker/` routes Tier 0 to Apps Script and Tier 1 to Cloud Run `/session/start`.
2. `container/` now runs signaling APIs: `/signal/register`, `/signal/heartbeat`, `/signal/nodes`, `/session/start`.
3. `colab/default.ipynb` runs browser worker node and self-registers with Cloud Run signal server.
4. `docs/user-guide.md` and `docs/tutorial-cloudrun-colab.md` provide user/operator tutorials.

## Next actions

- Replace in-memory signaling registry with durable store (Redis/Firestore).
- Add authenticated node registration tokens.
- Add WebSocket control channel between client and assigned worker node.
- Add vault encryption + Google Drive persistence in client app.
