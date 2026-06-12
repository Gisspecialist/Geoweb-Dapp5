import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { ethers } from 'ethers';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
const PORT = process.env.PORT || 8787;
const otpStore = new Map();

function sha256(input){ return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex'); }
function signer(){ if(!process.env.ORACLE_SIGNER_PRIVATE_KEY) return null; return new ethers.Wallet(process.env.ORACLE_SIGNER_PRIVATE_KEY); }

app.get('/health', (_,res)=>res.json({ ok:true, service:'GeoWeb3 backend with independent metadata + OSM rewards', mode:'non_esri_required', time:new Date().toISOString() }));

app.post('/api/esri/exchange-token', async (req,res)=>{
  const { code } = req.body;
  if(!code) return res.status(400).json({ error:'Missing OAuth authorization code' });
  if(!process.env.ESRI_CLIENT_ID || !process.env.ESRI_CLIENT_SECRET) {
    return res.json({ mode:'demo', access_token:'demo-esri-token', user:{ username:'demo_arcgis_user', email:'demo@example.com' }});
  }
  const params = new URLSearchParams({ client_id:process.env.ESRI_CLIENT_ID, client_secret:process.env.ESRI_CLIENT_SECRET, grant_type:'authorization_code', code, redirect_uri:process.env.ESRI_REDIRECT_URI });
  const tokenRes = await fetch('https://www.arcgis.com/sharing/rest/oauth2/token/', { method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body:params });
  const token = await tokenRes.json();
  res.status(tokenRes.ok ? 200 : 400).json(token);
});

app.post('/api/otp/send', async (req,res)=>{
  const email = String(req.body.email || '').trim().toLowerCase();
  if(!email) return res.status(400).json({ error:'email required' });
  const otp = String(Math.floor(100000 + Math.random()*900000));
  otpStore.set(email, { otp, expires: Date.now()+10*60*1000 });
  // Production: send through nodemailer/SendGrid. Demo returns OTP for local testing.
  res.json({ ok:true, mode:'demo', otp, message:'OTP generated. Configure SMTP to send it.' });
});

app.post('/api/otp/verify', (req,res)=>{
  const email = String(req.body.email || '').trim().toLowerCase();
  const record = otpStore.get(email);
  if(!record || Date.now() > record.expires || record.otp !== String(req.body.otp)) return res.status(401).json({ error:'Invalid or expired OTP' });
  otpStore.delete(email);
  res.json({ ok:true, user:{ email, linkedAt:new Date().toISOString() }});
});


function classifyMetadataSource(url, declaredType){
  const u = String(url || '').toLowerCase();
  if(declaredType) return declaredType;
  if(u.includes('service=wms')) return 'OGC WMS';
  if(u.includes('service=wfs')) return 'OGC WFS';
  if(u.includes('/collections') || u.includes('ogcapi')) return 'OGC API Features';
  if(u.endsWith('.geojson') || u.includes('geojson')) return 'GeoJSON';
  if(u.endsWith('.csv') || u.includes('csv')) return 'CSV with latitude/longitude';
  if(u.endsWith('.gpkg')) return 'GeoPackage';
  if(u.includes('openstreetmap.org/changeset')) return 'OpenStreetMap changeset';
  if(u) return 'Public API endpoint or data portal page';
  return 'Manual metadata only';
}

function validateIndependentMetadata(body){
  const required = ['title','description','steward'];
  const missing = required.filter(k => !String(body[k] || '').trim());
  const warnings = [];
  if(!body.license || String(body.license).toLowerCase().includes('unknown')) warnings.push('License needs review');
  if(!body.sourceUrl) warnings.push('No source URL supplied; record should remain manual/community-reviewed until evidence is added');
  if(!body.contact) warnings.push('No steward contact supplied');
  if(!body.bbox) warnings.push('Bounding box not supplied');
  if(!body.spatialReference) warnings.push('Spatial reference not supplied');
  return { ok: missing.length === 0, missing, warnings };
}

app.post('/api/metadata/validate', async (req,res)=>{
  const body = req.body || {};
  const validation = validateIndependentMetadata(body);
  const sourceType = classifyMetadataSource(body.sourceUrl, body.sourceType);
  let publicPreview = null;
  if(body.sourceUrl){
    try{
      const r = await fetch(body.sourceUrl, { timeout: 12000, redirect:'follow' });
      publicPreview = { reachable:r.ok, status:r.status, contentType:r.headers.get('content-type') || 'unknown' };
    } catch(e){
      publicPreview = { reachable:false, error:e.message, note:'Production must use SSRF protection and allowlisted protocols before fetching user URLs.' };
    }
  }
  const payload = { type:'independent_geospatial_metadata_validation', sourceType, validation, publicPreview, createdAt:new Date().toISOString() };
  const s = signer();
  payload.oracleSignature = s ? await s.signMessage(JSON.stringify(payload)) : 'demo-independent-metadata-signature-' + sha256(payload).slice(0,32);
  res.status(validation.ok ? 200 : 400).json(payload);
});

app.post('/api/metadata/register', async (req,res)=>{
  const body = req.body || {};
  const validation = validateIndependentMetadata(body);
  if(!validation.ok) return res.status(400).json({ error:'Metadata missing required fields', validation });
  const sourceType = classifyMetadataSource(body.sourceUrl, body.sourceType);
  const metadata = {
    name: body.title,
    description: body.description,
    external_url: body.sourceUrl || null,
    source_type: sourceType,
    metadata_mode: 'Independent / Non-Esri',
    steward: body.steward,
    contact: body.contact || null,
    license: body.license || 'Unknown / needs review',
    bbox: body.bbox || null,
    spatial_reference: body.spatialReference || null,
    update_frequency: body.updateFrequency || null,
    tags: body.tags || [],
    evidence: body.evidence || null,
    verification_status: 'pending_admin_or_dao_review',
    created_at: new Date().toISOString()
  };
  const metadataHash = sha256(metadata);
  const payload = { ok:true, type:'independent_geospatial_metadata_registration', metadataHash, metadata, ipfsUri:'ipfs://bafy-demo-' + metadataHash.slice(0,44), recommendedReward:100, status:'ready_for_mint_or_review' };
  const s = signer();
  payload.oracleSignature = s ? await s.signMessage(JSON.stringify(payload)) : 'demo-independent-registration-signature-' + metadataHash.slice(0,32);
  res.json(payload);
});

app.post('/api/service/inspect', async (req,res)=>{
  const url = String(req.body.url || '').trim();
  if(!url) return res.status(400).json({ error:'url required' });
  const pjsonUrl = url.includes('?') ? `${url}&f=pjson` : `${url.replace(/\/$/,'')}?f=pjson`;
  try{
    const r = await fetch(pjsonUrl, { timeout: 15000 });
    const json = await r.json();
    const payload = {
      ok:true,
      url,
      title: json.name || json.title || json.documentInfo?.Title || 'Untitled Geospatial Service',
      type: classifyMetadataSource(url) || (url.match(/(FeatureServer|MapServer|ImageServer|VectorTileServer)/)||[])[1] || json.type || 'Geospatial Service',
      layerCount: Array.isArray(json.layers) ? json.layers.length : 0,
      fieldCount: Array.isArray(json.fields) ? json.fields.length : 0,
      capabilities: json.capabilities || null,
      spatialReference: json.spatialReference || json.fullExtent?.spatialReference || null,
      checksum: sha256({url,json})
    };
    const s = signer();
    if(s) payload.oracleSignature = await s.signMessage(JSON.stringify(payload));
    res.json(payload);
  } catch(e){ res.status(502).json({ ok:false, error:e.message, url, needsManualReview:true }); }
});

app.post('/api/ipfs/pin-json', async (req,res)=>{
  const metadata = req.body;
  if(process.env.PINATA_JWT){
    const r = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', { method:'POST', headers:{'content-type':'application/json', authorization:`Bearer ${process.env.PINATA_JWT}`}, body:JSON.stringify(metadata)});
    const out = await r.json();
    return res.status(r.ok ? 200 : 400).json(out);
  }
  res.json({ IpfsHash:'bafy-demo-'+sha256(metadata).slice(0,44), PinSize: JSON.stringify(metadata).length, Timestamp:new Date().toISOString(), mode:'demo' });
});

app.post('/api/rewards/sign-event', async (req,res)=>{
  const event = { ...req.body, signedAt:new Date().toISOString() };
  const s = signer();
  if(!s) return res.json({ ...event, signature:'demo-signature-'+sha256(event).slice(0,32), mode:'demo' });
  res.json({ ...event, signer:s.address, signature: await s.signMessage(JSON.stringify(event)) });
});



app.get('/api/osm/user/:username', async (req,res)=>{
  const username = String(req.params.username || '').trim();
  if(!username) return res.status(400).json({ error:'username required' });
  // Production: use OSM OAuth or public OSM APIs to confirm account activity.
  res.json({ ok:true, username, mode:'demo', linked:true, note:'Public OSM user lookup placeholder. Wire to OSM API/OAuth for production.' });
});

app.get('/api/osm/changesets/:username', async (req,res)=>{
  const username = String(req.params.username || '').trim();
  const area = String(req.query.area || 'Belize');
  // Production: resolve OSM user id, fetch changesets from OSM API/Overpass, and score changes.
  res.json({ ok:true, mode:'demo', username, area, changesets:[
    { id:'149876543', created_at:new Date().toISOString(), comment:'Added shelters, road tags and community assets', area, featureCount:12, qualityPreview:88 },
    { id:'149876544', created_at:new Date().toISOString(), comment:'Corrected building tags and names', area, featureCount:7, qualityPreview:82 }
  ]});
});

app.post('/api/osm/verify-changeset', async (req,res)=>{
  const { osmUser, changesetId, area, contribution, featuresChanged = 1 } = req.body;
  if(!osmUser || !changesetId) return res.status(400).json({ error:'osmUser and changesetId are required' });
  const qualityScore = Math.min(98, 65 + Number(featuresChanged) * 2 + (String(contribution||'').length > 40 ? 10 : 0));
  const payload = {
    type:'osm_changeset_verification', osmUser, changesetId, area: area || 'unspecified', contribution: contribution || null,
    checks:{ claimedUserMatch:'pending_osm_oauth', validGeometry:'demo_pass', duplicateRisk:'needs_backend_spatial_check', revertCheck:'needs_osm_history_check', targetAreaMatch:'demo_pass' },
    qualityScore,
    recommendedStatus: qualityScore >= 80 ? 'approved_for_pilot' : 'dao_review_required',
    recommendedReward: qualityScore >= 90 ? 75 : qualityScore >= 80 ? 50 : 25,
    createdAt:new Date().toISOString()
  };
  const s = signer();
  payload.oracleSignature = s ? await s.signMessage(JSON.stringify(payload)) : 'demo-osm-signature-' + sha256(payload).slice(0,32);
  res.json(payload);
});

app.post('/api/osm/rewards/submit', async (req,res)=>{
  const { osmUser, changesetId, walletAddress, area, rewardAmount = 25 } = req.body;
  if(!osmUser || !changesetId) return res.status(400).json({ error:'osmUser and changesetId are required' });
  const claim = { type:'osm_mapping_reward_claim', claimId:'osm-' + sha256({ osmUser, changesetId, walletAddress, at:Date.now() }).slice(0,24), osmUser, changesetId, walletAddress:walletAddress||null, area:area||null, rewardAmount, status:'pending_admin_or_dao_review', createdAt:new Date().toISOString() };
  res.json(claim);
});

app.post('/api/faucet/claim', async (req,res)=>{
  const { claimant, serviceUrl, proof, bitcoinAddress, rewardAmount = 10 } = req.body;
  if(!claimant || !serviceUrl) return res.status(400).json({ error:'claimant and serviceUrl are required' });
  const payload = {
    type:'geoweb3_contribution_faucet_claim',
    claimant,
    serviceUrl,
    proof: proof || null,
    bitcoinAddress: bitcoinAddress || null,
    rewardAmount,
    status:'approved_for_pilot',
    claimId:'geo-faucet-' + sha256({ claimant, serviceUrl, proof, bitcoinAddress, at:Date.now() }).slice(0,24),
    createdAt:new Date().toISOString()
  };
  const s = signer();
  if(s) payload.oracleSignature = await s.signMessage(JSON.stringify(payload));
  else payload.oracleSignature = 'demo-faucet-signature-' + sha256(payload).slice(0,32);
  res.json(payload);
});

app.get('/api/faucet/status', (_,res)=>{
  res.json({ ok:true, mode: process.env.BITCOIN_FAUCET_MODE || 'demo', network: process.env.BITCOIN_NETWORK || 'testnet-or-lightning-pilot', message:'Faucet bridge is ready. Configure treasury keys and payout processor for production.' });
});

app.listen(PORT, ()=>console.log(`GeoWeb3 backend listening on http://localhost:${PORT}`));
