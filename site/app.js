const tabs = document.querySelectorAll('.tabs button');
const panels = document.querySelectorAll('.panel');

tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach((b) => b.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

async function getJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, status: res.status };
  }
}

document.getElementById('healthBtn').addEventListener('click', async () => {
  const signalUrl = document.getElementById('signalUrl').value.trim().replace(/\/$/, '');
  const out = document.getElementById('signalOut');
  if (!signalUrl) return (out.textContent = 'Please provide Cloud Run signal URL');
  out.textContent = JSON.stringify(await getJson(`${signalUrl}/health`), null, 2);
});

document.getElementById('nodesBtn').addEventListener('click', async () => {
  const signalUrl = document.getElementById('signalUrl').value.trim().replace(/\/$/, '');
  const out = document.getElementById('signalOut');
  if (!signalUrl) return (out.textContent = 'Please provide Cloud Run signal URL');
  out.textContent = JSON.stringify(await getJson(`${signalUrl}/signal/nodes`), null, 2);
});

document.getElementById('startSessionBtn').addEventListener('click', async () => {
  const workerUrl = document.getElementById('workerUrl').value.trim().replace(/\/$/, '');
  const targetUrl = document.getElementById('targetUrl').value.trim();
  const out = document.getElementById('workerOut');
  if (!workerUrl || !targetUrl) return (out.textContent = 'Provide worker URL and target URL');

  const route = `${workerUrl}?tier=1&q=${encodeURIComponent(targetUrl)}`;
  out.textContent = JSON.stringify(await getJson(route), null, 2);
});

document.getElementById('loadRecipesBtn').addEventListener('click', async () => {
  const out = document.getElementById('recipesOut');
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
