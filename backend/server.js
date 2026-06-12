import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.PUBLIC_FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));

const blockPrivateUrl = value => {
  try {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    const h = u.hostname.toLowerCase();
    return !(h === 'localhost' || h.startsWith('127.') || h.startsWith('10.') || h.startsWith('192.168.') || h === '0.0.0.0');
  } catch { return true; }
};

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'GeoWeb3 No-Esri Metadata API', time: new Date().toISOString() }));

app.post('/api/metadata/validate', async (req, res) => {
  const { title, steward, description, sourceUrl, type, license } = req.body || {};
  const errors = [];
  if (!title) errors.push('title is required');
  if (!steward) errors.push('data steward is required');
  if (!description) errors.push('description is required');
  if (sourceUrl && !blockPrivateUrl(sourceUrl)) errors.push('source URL is blocked for security');
  const quality = Math.max(45, Math.min(98, 70 + (license && !String(license).includes('Unknown') ? 8 : 0) + (sourceUrl ? 5 : 0) + (errors.length ? -15 : 10)));
  res.json({ ok: errors.length === 0, errors, quality, type: type || 'Manual metadata-only record', mode: 'Independent / Non-Esri' });
});

app.post('/api/metadata/register', async (req, res) => {
  const validation = { ok: true, quality: 88 };
  const id = `svc-${Date.now()}`;
  res.json({
    ok: true,
    id,
    validation,
    ipfsUri: `ipfs://bafy-demo-${id}`,
    txHash: `0x${Math.random().toString(16).slice(2).padEnd(40, '0')}`,
    status: 'pending_admin_review',
    message: 'Metadata accepted by backend scaffold. Connect Postgres, Pinata and Polygon for production.'
  });
});

app.post('/api/service/inspect', async (req, res) => {
  const { sourceUrl } = req.body || {};
  if (!sourceUrl || !blockPrivateUrl(sourceUrl)) return res.status(400).json({ ok: false, error: 'Invalid or blocked URL' });
  res.json({ ok: true, mode: 'public_non_esri_preview', sourceUrl, message: 'Production implementation should perform type-specific OGC/GeoJSON/CSV inspection here.' });
});

app.post('/api/osm/rewards/submit', (req, res) => res.json({ ok: true, status: 'pending_review', claim: req.body }));
app.post('/api/faucet/claim', (req, res) => res.json({ ok: true, status: 'pending_admin_review', claim: req.body }));
app.post('/api/dao/proposals', (req, res) => res.json({ ok: true, status: 'active', proposal: req.body }));

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`GeoWeb3 API listening on ${port}`));
