const tabs = document.querySelectorAll('.tabs button');
const panels = document.querySelectorAll('.panel');

const STORAGE_KEY = 'ubs-command-center-config';

tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach((b) => b.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

function byId(id) {
  return document.getElementById(id);
}

function sanitizeUrl(value) {
  return (value || '').trim().replace(/\/$/, '');
}

function getConfigFromInputs() {
  return {
    appsScriptUrl: sanitizeUrl(byId('cfgAppsScriptUrl')?.value),
    signalUrl: sanitizeUrl(byId('cfgSignalUrl')?.value),
    workerUrl: sanitizeUrl(byId('cfgWorkerUrl')?.value),
    recipeBase: sanitizeUrl(byId('cfgRecipeBase')?.value),
    region: byId('cfgRegion')?.value || 'us-east1',
  };
}

function setConfigToInputs(cfg) {
  if (!cfg) return;
  if (byId('cfgAppsScriptUrl')) byId('cfgAppsScriptUrl').value = cfg.appsScriptUrl || '';
  if (byId('cfgSignalUrl')) byId('cfgSignalUrl').value = cfg.signalUrl || '';
  if (byId('cfgWorkerUrl')) byId('cfgWorkerUrl').value = cfg.workerUrl || '';
  if (byId('cfgRecipeBase')) byId('cfgRecipeBase').value = cfg.recipeBase || '';
  if (byId('cfgRegion')) byId('cfgRegion').value = cfg.region || 'us-east1';

  if (byId('signalUrl')) byId('signalUrl').value = cfg.signalUrl || '';
  if (byId('workerUrl')) byId('workerUrl').value = cfg.workerUrl || '';
}

function renderSnippets(cfg) {
  const wrangler = `name = "ubs-router"
main = "index.js"
compatibility_date = "2024-12-01"

[[kv_namespaces]]
binding = "UBS_KV"
id = "replace-with-kv-namespace-id"

[vars]
RECIPE_REGISTRY_BASE = "${cfg.recipeBase || 'https://raw.githubusercontent.com/your-org/universal-basic-shell/main/recipes'}"
APPS_SCRIPT_URL = "${cfg.appsScriptUrl || 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'}"
CLOUD_RUN_SIGNAL_URL = "${cfg.signalUrl || 'https://your-signal-server-xyz.run.app'}"`;

  const tier1 = `${cfg.workerUrl || 'https://your-worker.workers.dev'}?tier=1&region=${cfg.region || 'us-east1'}&q=${encodeURIComponent('https://discord.com')}`;

  const colab = `UBS_SIGNAL_URL=${cfg.signalUrl || 'https://your-signal-server-xyz.run.app'}\nUBS_REGION=${cfg.region || 'us-east1'}`;

  const cloudShell = `git clone https://github.com/<YOUR_ORG>/universal-basic-shell.git
cd universal-basic-shell
ls container
gcloud config set project <YOUR_PROJECT_ID>
gcloud run deploy ubs-signal --source ./container --region us-central1 --allow-unauthenticated
# If source error appears: run pwd && ls, then cd into folder that contains container/`;

  byId('wranglerSnippet').textContent = wrangler;
  byId('tier1Snippet').textContent = tier1;
  byId('colabSnippet').textContent = colab;
  byId('cloudShellSnippet').textContent = cloudShell;
}

function saveConfig() {
  const cfg = getConfigFromInputs();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  setConfigToInputs(cfg);
  renderSnippets(cfg);
  byId('configStatus').textContent = `Saved config at ${new Date().toISOString()}`;
}

function loadConfig() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    byId('configStatus').textContent = 'No saved config found.';
    renderSnippets(getConfigFromInputs());
    return;
  }

  const cfg = JSON.parse(raw);
  setConfigToInputs(cfg);
  renderSnippets(cfg);
  byId('configStatus').textContent = `Loaded config from local storage.`;
}

function clearConfig() {
  localStorage.removeItem(STORAGE_KEY);
  setConfigToInputs({
    appsScriptUrl: '',
    signalUrl: '',
    workerUrl: '',
    recipeBase: 'https://raw.githubusercontent.com/your-org/universal-basic-shell/main/recipes',
    region: 'us-east1',
  });
  renderSnippets(getConfigFromInputs());
  byId('configStatus').textContent = 'Cleared saved config.';
}

async function getJson(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, status: res.status };
  }
}

byId('saveConfigBtn').addEventListener('click', saveConfig);
byId('loadConfigBtn').addEventListener('click', loadConfig);
byId('clearConfigBtn').addEventListener('click', clearConfig);

byId('healthBtn').addEventListener('click', async () => {
  const signalUrl = sanitizeUrl(byId('signalUrl').value);
  const out = byId('signalOut');
  if (!signalUrl) return (out.textContent = 'Please provide Cloud Run signal URL');
  out.textContent = JSON.stringify(await getJson(`${signalUrl}/health`), null, 2);
});

byId('nodesBtn').addEventListener('click', async () => {
  const signalUrl = sanitizeUrl(byId('signalUrl').value);
  const out = byId('signalOut');
  if (!signalUrl) return (out.textContent = 'Please provide Cloud Run signal URL');
  out.textContent = JSON.stringify(await getJson(`${signalUrl}/signal/nodes`), null, 2);
});

byId('startSessionBtn').addEventListener('click', async () => {
  const workerUrl = sanitizeUrl(byId('workerUrl').value);
  const targetUrl = byId('targetUrl').value.trim();
  const out = byId('workerOut');
  if (!workerUrl || !targetUrl) return (out.textContent = 'Provide worker URL and target URL');

  const route = `${workerUrl}?tier=1&q=${encodeURIComponent(targetUrl)}`;
  out.textContent = JSON.stringify(await getJson(route), null, 2);
});

byId('loadRecipesBtn').addEventListener('click', async () => {
  const out = byId('recipesOut');
  const files = [
    'recipes/discord/recipe.json',
    'recipes/gmail/recipe.json',
    'recipes/banking-generic/recipe.json',
  ];
  const loaded = {};

  for (const file of files) {
    loaded[file] = await getJson(file);
  }

  out.textContent = JSON.stringify(loaded, null, 2);
});

loadConfig();
