export async function analyzeUrl({ appsScriptUrl, targetUrl }) {
  const endpoint = new URL(appsScriptUrl);
  endpoint.searchParams.set('q', targetUrl);
  endpoint.searchParams.set('mode', 'analyze');

  const resp = await fetch(endpoint.toString());
  if (!resp.ok) {
    throw new Error(`Analyze failed: ${resp.status}`);
  }
  const data = await resp.json();
  return JSON.parse(data.analysis);
}
