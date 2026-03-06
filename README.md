# UBS — Universal Basic Shell

UBS is a privacy routing system that keeps a stable Cloudflare Worker front door while switching execution tiers behind it.

## GitHub Pages Command Center

The repo root (`index.html`) is now a full **command center** page for UBS.

From one page, you can:
- configure all required deployment settings,
- view generated config snippets,
- follow in-page step-by-step setup instructions,
- run live health/assignment checks,
- use the embedded PWA Generator and Universal PWA shell,
- inspect recipe examples.

## Start here

1. Open the command center page (`index.html`) locally or through GitHub Pages.
2. Go to **Command Center** tab and enter:
   - Apps Script URL
   - Cloud Run signal URL
   - Cloudflare Worker URL
   - recipe base + preferred region
3. Save config and copy generated snippets.
4. Follow **Setup Guide** tab to deploy Apps Script, Cloud Run, Worker, and Colab worker node.
5. Use **Live Checks** tab to validate `/health`, `/signal/nodes`, and Tier 1 assignment.

> Cloud Shell tip: if deployment says `could not find source [./container]`, you are in the wrong directory. In Cloud Shell, `cd` into the repo folder that contains `container/` before running `gcloud run deploy --source ./container ...`.

## Deep docs

- Full step-by-step markdown: `docs/setup-from-zero.md`
- User usage guide: `docs/user-guide.md`
- Tier 1 focused tutorial: `docs/tutorial-cloudrun-colab.md`
- Build handoff: `HANDOFF.md`

## Architecture

- **Tier 0**: Apps Script proxy
- **Tier 1**: Cloud Run signaling + Colab/Cloud Shell browser worker
- **Tier 2**: Headscale/WireGuard
- **Tier 3**: Volunteer residential nodes
