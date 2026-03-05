import express from 'express';

/**
 * Cloud Run role after architecture shift:
 * - Stateless signaling/operator plane.
 * - Receives session start requests from Worker.
 * - Picks an already-registered browser worker node (Colab/Cloud Shell).
 * - Returns connection instructions to client.
 */

const app = express();
app.use(express.json({ limit: '1mb' }));

const nodes = new Map();

app.get('/health', (_, res) => {
  res.json({ ok: true, role: 'signaling-server', nodes: nodes.size });
});

app.post('/signal/register', (req, res) => {
  const { id, connectUrl, region = 'us', capabilities = ['playwright'] } = req.body || {};
  if (!id || !connectUrl) {
    return res.status(400).json({ error: 'id and connectUrl required' });
  }

  nodes.set(id, {
    id,
    connectUrl,
    region,
    capabilities,
    lastSeen: Date.now(),
  });

  return res.json({ ok: true, nodeId: id });
});

app.post('/signal/heartbeat', (req, res) => {
  const { id } = req.body || {};
  const node = nodes.get(id);
  if (!node) return res.status(404).json({ error: 'node not found' });

  node.lastSeen = Date.now();
  nodes.set(id, node);
  return res.json({ ok: true, id, lastSeen: node.lastSeen });
});

app.get('/signal/nodes', (_, res) => {
  const now = Date.now();
  const active = [...nodes.values()].filter((n) => now - n.lastSeen < 5 * 60 * 1000);
  res.json({ ok: true, activeCount: active.length, nodes: active });
});

app.post('/session/start', (req, res) => {
  const { url, region } = req.body || {};
  if (!url) return res.status(400).json({ error: 'missing url' });

  const now = Date.now();
  const active = [...nodes.values()].filter((n) => now - n.lastSeen < 5 * 60 * 1000);
  if (!active.length) {
    return res.status(503).json({
      error: 'no browser worker nodes available',
      hint: 'Start Colab/Cloud Shell worker and register with /signal/register',
    });
  }

  const preferred = region
    ? active.find((n) => n.region === region)
    : null;
  const selected = preferred || active[0];

  return res.json({
    ok: true,
    mode: 'signal-assignment',
    assignedNode: {
      id: selected.id,
      connectUrl: selected.connectUrl,
      region: selected.region,
    },
    targetUrl: url,
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`UBS signaling server listening on ${port}`);
});
