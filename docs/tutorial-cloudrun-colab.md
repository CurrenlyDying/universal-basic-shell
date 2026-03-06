# Tutorial: Cloud Run Signaling + Colab Worker Node

This is the focused Tier 1 tutorial. For full setup (Apps Script + Worker + Pages + Tier 1), see `docs/setup-from-zero.md`.

## Architecture
- **Cloud Run = signaling/operator (stateless)**
- **Colab/Cloud Shell = browser worker node (stateful runtime)**

## Step A — Deploy Cloud Run signal server
1. In Cloud Shell, first clone repo and move to repo root:
   ```bash
   git clone https://github.com/<YOUR_ORG>/universal-basic-shell.git
   cd universal-basic-shell
   ls container
   ```
2. Deploy `container/` to Cloud Run:
   ```bash
   gcloud run deploy ubs-signal --source ./container --region us-central1 --allow-unauthenticated
   ```
3. Confirm health:
   - `GET /health` returns `role: signaling-server`.
4. Save URL, example:
   - `https://ubs-signal-xyz.run.app`

> If you see `could not find source [./container]`, you are in the wrong directory. Run `pwd` and `ls` and `cd` into the folder that contains `container/`.

## Step B — Start Colab worker node
1. Open `colab/default.ipynb` in Colab.
2. Set `UBS_SIGNAL_URL` to Cloud Run URL.
3. Run all cells.
4. Confirm:
   - successful `/signal/register`
   - recurring `/signal/heartbeat`

## Step C — Configure Worker to call signal server
1. Set `CLOUD_RUN_SIGNAL_URL` in `worker/wrangler.toml`.
2. Deploy worker with Wrangler.

## Step D — Validate assignment
1. Hit worker:
   - `?q=https://discord.com&tier=1`
2. Confirm response includes `assignedNode.connectUrl`.

## Troubleshooting
- `503 no browser worker nodes available`: start/restart Colab worker.
- registration fails: verify `UBS_SIGNAL_URL` and tunnel URL.
- region mismatch: provide region in worker request and matching node region.
