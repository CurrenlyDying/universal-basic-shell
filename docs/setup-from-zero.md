# UBS Setup From Zero (Step-by-Step)

This guide walks through **everything you need** to run UBS end-to-end:

1. Google Apps Script URL (Tier 0)
2. Cloud Run signaling server (Tier 1 operator)
3. Cloudflare Worker router (front door)
4. Colab worker node (Tier 1 browser runtime)
5. GitHub Pages portal usage

---

## 0) Prerequisites

- A Google account (for Apps Script + optional Cloud Run + Colab)
- A Cloudflare account (free tier is fine)
- Node.js 20+
- `npm` and `npx`
- Optional: `gcloud` CLI for Cloud Run deploys

---

## 1) Create the Apps Script URL (Tier 0)

### 1.1 Create script project
1. Go to <https://script.google.com>.
2. Click **New project**.
3. Create two files:
   - `proxy.gs` (paste from `apps-script/proxy.gs`)
   - `gemini.gs` (paste from `apps-script/gemini.gs`)

### 1.2 Add Gemini key
1. In Apps Script, open **Project Settings**.
2. Under **Script Properties**, add key:
   - `GEMINI_KEY=<your_google_ai_studio_key>`

### 1.3 Deploy as web app
1. Click **Deploy** → **New deployment**.
2. Type: **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Deploy and copy URL (looks like `https://script.google.com/macros/s/.../exec`).

This is your `APPS_SCRIPT_URL`.

---

## 2) Deploy Cloud Run signaling server

The signaling server is in `container/` and exposes:
- `GET /health`
- `POST /signal/register`
- `POST /signal/heartbeat`
- `GET /signal/nodes`
- `POST /session/start`

### 2.1 **Cloud Shell-safe steps (recommended)**

> If you run `gcloud run deploy --source ./container` from the wrong folder, you get:
> `ERROR: (gcloud.run.deploy) could not find source [./container]`.

Run these exact commands in Cloud Shell:

```bash
git clone https://github.com/<YOUR_ORG>/universal-basic-shell.git
cd universal-basic-shell
pwd
ls
ls container
```

Now deploy from repo root:

```bash
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>
gcloud run deploy ubs-signal \
  --source ./container \
  --region us-central1 \
  --allow-unauthenticated
```

### 2.2 If repo folder name is different
If you downloaded zip or used a different directory name, `cd` into the folder that actually contains `container/` first.

Quick check:

```bash
find . -maxdepth 2 -type d -name container
```

Then deploy using that discovered path, for example:

```bash
gcloud run deploy ubs-signal --source /home/<you>/my-folder/container --region us-central1 --allow-unauthenticated
```

### 2.3 Save deployed URL
After deploy, copy service URL (example: `https://ubs-signal-abc-uc.a.run.app`).

This is your `CLOUD_RUN_SIGNAL_URL`.

---

## 3) Configure and deploy Cloudflare Worker

Worker code is in `worker/`.

### 3.1 Create KV namespace

```bash
cd worker
npx wrangler login
npx wrangler kv namespace create UBS_KV
```

Copy namespace id from output.

### 3.2 Create worker config
1. Copy `worker/wrangler.toml.example` to `worker/wrangler.toml`.
2. Fill in:
   - KV namespace id
   - `APPS_SCRIPT_URL`
   - `RECIPE_REGISTRY_BASE` (keep default if using this repo)
   - `CLOUD_RUN_SIGNAL_URL`

### 3.3 Deploy worker

```bash
cd worker
npx wrangler deploy
```

Copy worker URL (example: `https://ubs-router.<subdomain>.workers.dev`).

---

## 4) Start a Colab worker node (Tier 1 browser)

1. Open `colab/default.ipynb` in Google Colab.
2. Set environment variable in notebook runtime:
   - `UBS_SIGNAL_URL=<your_cloud_run_signal_url>`
3. Run all cells.
4. Confirm notebook logs:
   - a public worker `connectUrl`
   - register success from `/signal/register`
   - periodic heartbeat success from `/signal/heartbeat`

Now Cloud Run can assign this worker for Tier 1 sessions.

---

## 5) Use the GitHub Pages portal

The repo root `index.html` is your single control center.

### 5.1 Publish on GitHub Pages
1. Push repo to GitHub.
2. Go to **Settings → Pages**.
3. Source: Deploy from branch.
4. Branch: your working branch (or `main`) / root.
5. Open published URL.

### 5.2 Use portal tabs
- **PWA Generator**: analyze and generate artifacts
- **Universal PWA Shell**: test route behavior
- **Command Center**: save URLs + generate config snippets
- **Live Checks**:
  - set Cloud Run signal URL, run `/health` and `/signal/nodes`
  - set Worker URL and start Tier 1 session
- **Recipe Registry**: inspect sample recipes

---

## 6) End-to-end validation checklist

1. `CLOUD_RUN_SIGNAL_URL/health` returns `ok: true`.
2. Colab notebook successfully registers node.
3. `CLOUD_RUN_SIGNAL_URL/signal/nodes` shows at least one active node.
4. Worker request:
   - `https://<worker>?tier=1&q=https://discord.com`
   returns assignment payload with `assignedNode.connectUrl`.
5. Tier 0 request:
   - `https://<worker>?tier=0&q=https://example.com`
   returns Apps Script-proxied response.

---

## 7) Common issues

- **403 from Apps Script**: ensure deployment is `Anyone` and latest version deployed.
- **could not find source [./container]**: you are not in repo root. Run `pwd`, `ls`, then `cd` into folder containing `container/`.
- **Worker can’t reach signal URL**: verify `CLOUD_RUN_SIGNAL_URL` variable in worker config.
- **No active nodes**: rerun Colab notebook and verify heartbeats.
- **CORS/browser limitations** in portal checks: confirm endpoints allow cross-origin usage for your testing setup.

