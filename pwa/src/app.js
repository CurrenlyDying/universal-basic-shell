const workerEndpoint = 'https://ubs-router.example.workers.dev';

const urlInput = document.getElementById('url');
const result = document.getElementById('result');

document.getElementById('go').addEventListener('click', async () => {
  const target = urlInput.value.trim();
  const endpoint = `${workerEndpoint}?q=${encodeURIComponent(target)}`;
  const resp = await fetch(endpoint);
  const body = await resp.text();
  result.textContent = body.slice(0, 3000);
});
