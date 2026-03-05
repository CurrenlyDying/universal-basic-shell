# Tutorial: Cloud Run Signaling + Colab Worker Node

This tutorial implements the architecture shift:
- **Cloud Run = signaling/operator (stateless)**
- **Colab/Cloud Shell = browser worker node (stateful browser runtime)**

## Step A — Deploy Cloud Run signal server
1. Build and deploy `container/` to Cloud Run.
2. Confirm health endpoint:
   - `GET /health` returns `role: signaling-server`.
3. Note Cloud Run URL, e.g. `https://ubs-signal-xyz.run.app`.

## Step B — Start Colab worker node
1. Open `colab/default.ipynb` in Colab.
2. Set env var `UBS_SIGNAL_URL` to your Cloud Run URL.
3. Run all cells.
4. Verify registration output from `/signal/register`.
5. Verify periodic `/signal/heartbeat` messages.

## Step C — Configure Cloudflare Worker
Set `CLOUD_RUN_SIGNAL_URL` variable in Worker to your Cloud Run URL.
When Tier 1 is selected, Worker forwards to `/session/start`.

## Step D — Verify end-to-end
1. Call Worker URL with `?q=https://discord.com&tier=1`.
2. Confirm response contains `assignedNode.connectUrl`.
3. Ensure assigned node is your Colab/Cloud Shell runtime.

## Troubleshooting
- `503 no browser worker nodes available`: start/restart Colab worker node.
- Registration failing: verify `UBS_SIGNAL_URL` and public tunnel URL.
- Region mismatch: pass `region` query parameter to Worker and register node with same region.
