const RECIPE_CACHE_TTL_SECONDS = 300;
const NODE_HEARTBEAT_TTL_SECONDS = 360;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json({ ok: true, service: 'ubs-worker-router' });
    }

    if (url.pathname === '/register-node' && request.method === 'POST') {
      return registerNode(request, env);
    }

    if (url.pathname === '/nodes' && request.method === 'GET') {
      return listActiveNode(env);
    }

    const target = url.searchParams.get('q');
    if (!target) return json({ error: 'missing q param' }, 400);

    const recipeId = url.searchParams.get('recipe') || inferRecipeId(target);
    const forcedTier = url.searchParams.get('tier');
    const recipe = recipeId ? await getRecipe(recipeId, env, ctx) : { id: 'default', tier: 0 };
    const tier = normalizeTier(forcedTier ?? recipe?.tier ?? 0);

    if (tier === 1) {
      // Architecture shift:
      // Worker no longer forwards directly to a browser node.
      // Worker forwards to stateless Cloud Run signaling server, which assigns a node.
      return forwardToSignalingServer(request, env);
    }

    return proxyToAppsScript(request, env);
  },
};

async function getRecipe(recipeId, env, ctx) {
  const cacheKey = `recipe:${recipeId}`;
  const cached = await env.UBS_KV.get(cacheKey, { type: 'json' });
  if (cached) return cached;

  const endpoint = `${env.RECIPE_REGISTRY_BASE}/${recipeId}/recipe.json`;
  const resp = await fetch(endpoint);
  if (!resp.ok) return { id: recipeId, tier: 0 };

  const recipe = await resp.json();
  ctx.waitUntil(
    env.UBS_KV.put(cacheKey, JSON.stringify(recipe), {
      expirationTtl: RECIPE_CACHE_TTL_SECONDS,
    })
  );
  return recipe;
}

function inferRecipeId(targetUrl) {
  try {
    const host = new URL(targetUrl).hostname.replace('www.', '');
    if (host.includes('discord')) return 'discord';
    if (host.includes('mail.google')) return 'gmail';
    if (host.includes('bank')) return 'banking-generic';
  } catch {
    return null;
  }
  return null;
}

function normalizeTier(tier) {
  const parsed = Number(tier);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function registerNode(request, env) {
  const body = await request.json();
  const { id, connectUrl, region = 'us', tier = 1, runtime = 'colab' } = body;

  if (!id || !connectUrl) {
    return json({ error: 'id and connectUrl required' }, 400);
  }

  const node = { id, connectUrl, region, tier, runtime, ts: Date.now() };
  await env.UBS_KV.put(`node:${id}`, JSON.stringify(node), {
    expirationTtl: NODE_HEARTBEAT_TTL_SECONDS,
  });

  if (tier === 1) {
    await env.UBS_KV.put('tier1:active', id, { expirationTtl: NODE_HEARTBEAT_TTL_SECONDS });
  }

  return json({ ok: true, node });
}

async function listActiveNode(env) {
  const id = await env.UBS_KV.get('tier1:active');
  if (!id) return json({ ok: true, active: null });
  const node = await env.UBS_KV.get(`node:${id}`, { type: 'json' });
  return json({ ok: true, active: node });
}

function proxyToAppsScript(request, env) {
  const url = new URL(request.url);
  const target = url.searchParams.get('q');
  const upstream = `${env.APPS_SCRIPT_URL}?q=${encodeURIComponent(target)}`;
  return fetch(upstream, { method: 'GET' });
}

function forwardToSignalingServer(request, env) {
  const url = new URL(request.url);
  const payload = {
    url: url.searchParams.get('q'),
    recipe: url.searchParams.get('recipe') || null,
    region: url.searchParams.get('region') || null,
    tier: 1,
  };

  return fetch(`${env.CLOUD_RUN_SIGNAL_URL}/session/start`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ubs-router': 'cloudflare-worker',
    },
    body: JSON.stringify(payload),
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
