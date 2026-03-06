import { analyzeUrl } from './analyzer.js';
import { generateRecipe, generateManifest, generateServiceWorker } from './pwagen.js';

let analysis = null;

const targetInput = document.getElementById('targetUrl');
const appsScriptInput = document.getElementById('appsScriptUrl');
const regionInput = document.getElementById('region');
const analysisOut = document.getElementById('analysis');
const recipeOut = document.getElementById('recipeOut');

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  try {
    analysis = await analyzeUrl({
      appsScriptUrl: appsScriptInput.value.trim(),
      targetUrl: targetInput.value.trim(),
    });
    analysisOut.textContent = JSON.stringify(analysis, null, 2);
  } catch (err) {
    analysisOut.textContent = String(err.message || err);
  }
});

document.getElementById('genBtn').addEventListener('click', () => {
  if (!analysis) {
    recipeOut.textContent = 'Run analysis first.';
    return;
  }

  const targetUrl = targetInput.value.trim();
  const region = regionInput.value;
  const recipe = generateRecipe({ targetUrl, analysis, region });
  const manifest = generateManifest({ analysis, targetUrl });
  const sw = generateServiceWorker({
    workerUrl: 'https://ubs-router.example.workers.dev',
    targetDomain: new URL(targetUrl).hostname,
  });

  recipeOut.textContent = JSON.stringify({ recipe, manifest, serviceWorker: sw }, null, 2);
});
