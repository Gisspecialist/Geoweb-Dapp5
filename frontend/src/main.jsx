import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const initialState = {
  user: null,
  activeView: 'dashboard',
  settings: { demoMode: true, noEsriMode: true, chain: 'Polygon Amoy', siteMode: 'Pilot production MVP' },
  linkedAccounts: { wallet: '', email: '', osm: '', agency: '', verification: 'User-declared' },
  services: [
    {
      id: 'svc-001', tokenId: 1001, title: 'Belize Protected Areas Open Metadata Record', type: 'GeoJSON', sourceUrl: 'https://example.org/open-data/protected-areas.geojson',
      submissionMode: 'Independent / Non-Esri', steward: 'Belize conservation data steward', contact: 'metadata@example.org', license: 'CC-BY-4.0', status: 'Community Verified', quality: 92,
      owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', ipfs: 'ipfs://bafybeigdyrztc4demo001', tx: '0x8f1a2d91d22f7843e120', version: 3,
      bbox: '-89.25, 15.80, -87.50, 18.50', srs: 'EPSG:4326', updateFrequency: 'Quarterly', tags: ['Belize', 'protected areas', 'conservation', 'open metadata'],
      description: 'Independent metadata record submitted outside the Esri platform for discoverability, provenance, quality review, community verification and rewards.',
      evidence: 'Public open-data page, steward declaration and community review record.',
      history: [
        { version: 3, date: '2026-06-06', tx: '0x8f1a2d91d22f7843e120', note: 'License and verification update' },
        { version: 2, date: '2026-06-05', tx: '0xbd910192e120', note: 'Steward/contact update' },
        { version: 1, date: '2026-06-05', tx: '0xa8411140', note: 'Initial independent metadata registration' }
      ]
    }
  ],
  rewards: { claimable: 210, total: 210, epoch: 37, epochTarget: 1000, usageEvents: 13 },
  rewardLedger: [
    { date: '2026-06-05', type: 'METADATA_MINT', item: 'Belize Protected Areas Open Metadata Record', amount: 100, status: 'Credited' },
    { date: '2026-06-05', type: 'QUALITY_BONUS', item: 'Community metadata validation', amount: 50, status: 'Credited' },
    { date: '2026-06-06', type: 'OSM_REWARD', item: 'OSM changeset 149876543', amount: 60, status: 'Credited' }
  ],
  osmClaims: [
    { id: 'osm-001', osmUser: 'demo_mapper_bz', changeset: '149876543', area: 'Belize', contribution: 'Added hurricane shelter points and corrected road tags', features: 12, quality: 88, reward: 60, status: 'Approved' }
  ],
  faucetClaims: [
    { id: 'faucet-001', claimant: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', item: 'Belize Protected Areas Open Metadata Record', proof: 'geo-contribution-demo-proof-001', reward: 15, status: 'Approved' }
  ],
  proposals: [
    { id: 'dao-001', title: 'Verify independent metadata claim for Protected Areas layer', item: 'Belize Protected Areas Open Metadata Record', status: 'Active', forVotes: 14, againstVotes: 2, detail: 'Community members vote whether the submitted metadata, source URL, steward information and evidence are sufficient for verification.' }
  ],
  auditLog: [
    { date: '2026-06-05', type: 'METADATA_MINT', item: 'Belize Protected Areas Open Metadata Record', tx: '0x8f1a2d91d22f7843e120', amount: '+100 GEOW' },
    { date: '2026-06-05', type: 'DAO_REVIEW', item: 'Protected Areas verification', tx: '0x21c55103fda9b01e', amount: '14 votes' },
    { date: '2026-06-06', type: 'OSM_REWARD', item: 'OSM changeset 149876543', tx: '0xc4f010ac8801', amount: '+60 GEOW' }
  ]
};

const views = [
  ['dashboard', 'Dashboard'], ['landing', 'Public Landing Page'], ['account', 'Account Linking'], ['submit', 'Submit Metadata'], ['registry', 'Registry / Ownership'], ['update', 'Metadata Updates'], ['rewards', 'Rewards'], ['osm', 'OSM Rewards'], ['faucet', 'Contribution Faucet'], ['dao', 'DAO Verification'], ['log', 'Audit / On-Chain Log'], ['compliance', 'Compliance'], ['production', 'Production Readiness'], ['backup', 'Export / Import']
];
const metadataTypes = ['OGC API Features', 'OGC WMS', 'OGC WFS', 'GeoJSON', 'CSV with latitude/longitude', 'GeoPackage', 'Shapefile / ZIP reference', 'OpenStreetMap changeset', 'Public API endpoint', 'Open-data portal page', 'Manual metadata-only record', 'Other non-Esri source'];
const licenses = ['CC-BY-4.0', 'CC0', 'Open Data Commons ODbL', 'Government Open Data License', 'Public domain', 'Custom license', 'Unknown / needs review'];
const now = () => new Date().toISOString().slice(0, 10);
const rand = (prefix = '0x') => prefix + Array.from(crypto.getRandomValues(new Uint8Array(10))).map(b => b.toString(16).padStart(2, '0')).join('');
const scoreStatus = q => q >= 90 ? 'Community Verified' : q >= 80 ? 'Pending Admin Review' : 'Pending DAO Review';
const short = v => String(v || '').length > 24 ? String(v).slice(0, 10) + '…' + String(v).slice(-8) : String(v || '');

function usePersistentState() {
  const [state, setState] = useState(() => {
    try { return { ...initialState, ...(JSON.parse(localStorage.getItem('geoweb3.restored.v4')) || {}) }; } catch { return initialState; }
  });
  useEffect(() => localStorage.setItem('geoweb3.restored.v4', JSON.stringify(state)), [state]);
  return [state, setState];
}

function App() {
  const [state, setState] = usePersistentState();
  const [active, setActive] = useState(state.activeView || 'dashboard');
  const [toast, setToast] = useState('');
  const update = patch => setState(s => ({ ...s, ...patch }));
  const flash = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const login = kind => { update({ user: { kind, id: kind === 'Wallet' ? rand('0x') : 'demo.user@geoweb3.org' } }); flash('Connected in pilot mode.'); };
  const logout = () => update({ user: null });
  if (!state.user) return <AuthScreen login={login} />;
  return <div className="appShell">
    <aside className="sidebar">
      <div className="brand"><span>🌐</span><div><b>GeoWeb3</b><small>No-Esri metadata registry</small></div></div>
      <div className="account"><span className="statusDot" />{state.user.kind}: {short(state.user.id)}</div>
      <nav>{views.map(([id, label]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}>{label}</button>)}</nav>
      <button className="danger" onClick={logout}>Disconnect</button>
      <p className="sideNote">This restored build keeps the original-style modules while adding independent metadata submission outside Esri.</p>
    </aside>
    <main className="content">
      <header className="topbar"><div><p className="eyebrow">{state.settings.siteMode}</p><h1>{views.find(v => v[0] === active)?.[1]}</h1></div><button className="ghost" onClick={() => simulateEvent(state, setState, flash)}>Simulate validation event</button></header>
      <View active={active} state={state} setState={setState} flash={flash} setActive={setActive} />
    </main>
    {toast && <div className="toast">{toast}</div>}
  </div>;
}

function AuthScreen({ login }) {
  const [showOtp, setShowOtp] = useState(false);
  return <div className="authPage">
    <section className="authHero glass">
      <span className="pill">Restored GeoWeb3 • Independent Metadata • OSM Rewards • DAO Review</span>
      <h1>Register, verify, track and reward geospatial metadata without relying on Esri infrastructure.</h1>
      <p>This version avoids ArcGIS organization IDs, Esri OAuth secrets and private platform APIs. Users submit metadata directly from open standards, public APIs, OSM changesets, file references, open-data portals or manual metadata records.</p>
      <div className="metricGrid"><Metric value="Non-Esri" label="metadata mode" /><Metric value="IPFS" label="snapshot ready" /><Metric value="GEOW" label="rewards" /><Metric value="DAO" label="review" /></div>
    </section>
    <section className="card authCard"><h2>Connect to continue</h2><p className="muted">Use a wallet or email account. Esri login is optional for future integration and is not needed here.</p><button onClick={() => login('Wallet')}>Connect Web3 Wallet</button><button className="secondary" onClick={() => setShowOtp(!showOtp)}>Use Email / OTP</button>{showOtp && <div className="stack"><label>Email<input placeholder="name@example.com" /></label><label>OTP<input placeholder="123456" /></label><button className="ghost" onClick={() => login('Email')}>Verify OTP</button><small>Demo OTP: 123456. Production sends this from the backend.</small></div>}</section>
  </div>;
}
function Metric({ value, label }) { return <div className="metric"><b>{value}</b><span>{label}</span></div>; }

function View(props) {
  const map = { dashboard: Dashboard, landing: Landing, account: AccountLinking, submit: SubmitMetadata, registry: Registry, update: MetadataUpdates, rewards: Rewards, osm: OSMRewards, faucet: ContributionFaucet, dao: DAO, log: AuditLog, compliance: Compliance, production: ProductionReadiness, backup: Backup };
  const C = map[props.active] || Dashboard; return <C {...props} />;
}

function Dashboard({ state }) {
  const verified = state.services.filter(s => s.status.includes('Verified')).length;
  return <><div className="grid4"><Metric value={state.services.length} label="metadata records" /><Metric value={verified} label="verified records" /><Metric value={state.rewards.claimable} label="claimable GEOW" /><Metric value={state.proposals.filter(p => p.status === 'Active').length} label="active DAO reviews" /></div><div className="grid2"><section className="card"><h2>Restored original feature set</h2><ul className="checklist"><li>Account linking and wallet/email login</li><li>Dashboard and public landing content</li><li>Submit Metadata outside Esri</li><li>Registry / ownership tracking</li><li>Metadata update and version history</li><li>Rewards engine and claimable GEOW</li><li>OSM map rewards</li><li>Contribution faucet</li><li>DAO/community verification</li><li>Audit/on-chain style log</li><li>Compliance and production readiness</li><li>Export/import backup</li></ul></section><section className="card"><h2>No-Esri submission principle</h2><p>Users submit and manage geospatial metadata independently of ArcGIS/Esri. A record can reference OGC services, GeoJSON, CSV, GeoPackage, shapefile/ZIP references, OSM changesets, public APIs, open-data portal pages or manual metadata. Esri OAuth may be added later as an optional verification method, but it is not required.</p><div className="notice">Trust labels are explicit: user-declared, admin-reviewed, community-verified, DAO-disputed or agency-verified when an agency formally participates.</div></section></div><section className="card"><h2>Recent audit events</h2><Table rows={state.auditLog} /></section></>;
}
function Landing() { return <section className="card"><h2>Public landing page copy</h2><div className="heroPanel"><h1>GeoWeb3 registers trusted geospatial metadata and rewards verified mapping contributions.</h1><p>For agencies, GIS professionals, NGOs, universities, community mapping groups and open-data stewards who need transparent provenance, version history, quality review and contributor incentives without being locked to one GIS platform.</p></div><div className="grid3"><Info title="What it does" text="Creates a registry of geospatial metadata records with source evidence, version history, trust labels, IPFS-ready snapshots and blockchain-style audit trails." /><Info title="Who it helps" text="GIS teams, protected area managers, disaster response groups, community mapping projects, open data portals and consultants." /><Info title="Why it matters" text="Registering a GIS metadata record makes data easier to discover, review, cite, track, reward and govern." /></div></section>; }
function Info({ title, text }) { return <div className="info"><b>{title}</b><p>{text}</p></div>; }

function AccountLinking({ state, setState, flash }) {
  const [form, setForm] = useState(state.linkedAccounts);
  const save = () => { setState(s => ({ ...s, linkedAccounts: form })); flash('Account links saved.'); };
  return <section className="card"><h2>Account linking</h2><p className="muted">The original app expected Web3 and Esri-style account linking. This restored build keeps account linking but makes Esri optional. Production can link wallet, email, OSM username and agency domain without exposing sensitive platform credentials.</p><div className="grid2"><label>Wallet address<input value={form.wallet} onChange={e => setForm({ ...form, wallet: e.target.value })} placeholder="0x..." /></label><label>Email<input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@example.org" /></label><label>OSM username<input value={form.osm} onChange={e => setForm({ ...form, osm: e.target.value })} placeholder="openstreetmap username" /></label><label>Agency / organization domain<input value={form.agency} onChange={e => setForm({ ...form, agency: e.target.value })} placeholder="agency.gov or organization.org" /></label><label>Verification label<select value={form.verification} onChange={e => setForm({ ...form, verification: e.target.value })}><option>User-declared</option><option>Email-domain verified</option><option>Admin-reviewed</option><option>Community-reviewed</option><option>Agency-verified</option></select></label></div><button onClick={save}>Save account links</button></section>;
}

function SubmitMetadata({ state, setState, flash, setActive }) {
  const [f, setF] = useState({ type: 'GeoJSON', sourceUrl: '', title: '', steward: '', contact: '', license: 'CC-BY-4.0', bbox: '', srs: 'EPSG:4326', frequency: 'As needed', tags: '', description: '', evidence: '' });
  const [preview, setPreview] = useState('No preview yet. Fill out the form and click Validate / Preview.');
  const change = e => setF({ ...f, [e.target.name]: e.target.value });
  const validate = () => {
    const missing = ['title', 'steward', 'description'].filter(k => !f[k]);
    const msg = [`Submission mode: Independent / Non-Esri`, `Type: ${f.type}`, `Source: ${f.sourceUrl || 'Manual metadata-only record'}`, `License: ${f.license}`, `Required checks: ${missing.length ? missing.join(', ') + ' missing' : 'passed'}`, `Production note: backend should validate URLs safely, block private/internal IPs and pin metadata to IPFS.`].join('\n');
    setPreview(msg);
  };
  const register = () => {
    if (!f.title || !f.description || !f.steward) return flash('Title, steward and description are required.');
    const q = Math.min(98, 70 + (f.contact ? 5 : 0) + (f.bbox ? 5 : 0) + (f.license.includes('Unknown') ? 0 : 8) + (f.evidence.length > 30 ? 10 : 0) + Math.floor(Math.random() * 6));
    const svc = { id: 'svc-' + Date.now(), tokenId: 1000 + state.services.length + 1, title: f.title, type: f.type, sourceUrl: f.sourceUrl || 'Manual metadata-only record', submissionMode: 'Independent / Non-Esri', steward: f.steward, contact: f.contact, license: f.license, status: scoreStatus(q), quality: q, owner: state.user.id, ipfs: 'ipfs://bafy' + rand('').slice(0, 32), tx: rand('0x'), version: 1, bbox: f.bbox, srs: f.srs, updateFrequency: f.frequency, tags: f.tags.split(',').map(x => x.trim()).filter(Boolean), description: f.description, evidence: f.evidence, history: [{ version: 1, date: now(), tx: 'pending', note: 'Initial independent metadata registration' }] };
    svc.history[0].tx = svc.tx;
    const reward = q >= 90 ? 150 : 100;
    setState(s => ({ ...s, services: [svc, ...s.services], rewards: { ...s.rewards, claimable: s.rewards.claimable + reward, total: s.rewards.total + reward }, rewardLedger: [{ date: now(), type: 'METADATA_MINT', item: svc.title, amount: reward, status: 'Credited' }, ...s.rewardLedger], auditLog: [{ date: now(), type: 'METADATA_MINT', item: svc.title, tx: svc.tx, amount: `+${reward} GEOW` }, ...s.auditLog] }));
    flash(`Metadata registered. ${reward} GEOW credited in pilot mode.`); setActive('registry');
  };
  return <section className="card"><div className="steps"><span className="on">1 Metadata</span><span>2 Source / Proof</span><span>3 License</span><span>4 Review</span><span>5 Register</span></div><div className="notice"><b>New requirement implemented:</b> users submit service metadata outside the Esri environment. ArcGIS IDs, OAuth client secrets, private Esri APIs and organization infrastructure are not required.</div><div className="grid2"><div className="form"><label>Source type<select name="type" value={f.type} onChange={change}>{metadataTypes.map(t => <option key={t}>{t}</option>)}</select></label><label>Optional source URL / file reference<input name="sourceUrl" value={f.sourceUrl} onChange={change} placeholder="OGC endpoint, GeoJSON URL, data portal page, file reference or manual" /></label><label>Title<input name="title" value={f.title} onChange={change} placeholder="Dataset or service title" /></label><label>Data steward / organization<input name="steward" value={f.steward} onChange={change} /></label><label>Contact<input name="contact" value={f.contact} onChange={change} /></label><label>License<select name="license" value={f.license} onChange={change}>{licenses.map(x => <option key={x}>{x}</option>)}</select></label><label>Bounding box<input name="bbox" value={f.bbox} onChange={change} placeholder="minX,minY,maxX,maxY" /></label><label>Spatial reference<input name="srs" value={f.srs} onChange={change} /></label><label>Update frequency<input name="frequency" value={f.frequency} onChange={change} /></label><label>Tags<input name="tags" value={f.tags} onChange={change} placeholder="flood, roads, Belize" /></label></div><div className="form"><label>Description<textarea name="description" value={f.description} onChange={change} rows="7" /></label><label>Evidence / proof note<textarea name="evidence" value={f.evidence} onChange={change} rows="5" placeholder="Open-data portal link, steward statement, publication, OSM changeset, public website proof, etc." /></label><button onClick={validate}>Validate / Preview</button><pre>{preview}</pre><button onClick={register}>Register Metadata and Credit Reward</button></div></div></section>;
}

function Registry({ state }) { return <div className="cards">{state.services.map(s => <section className="card service" key={s.id}><div className="cardHead"><div><span className="pill">{s.submissionMode}</span><h2>{s.title}</h2></div><b className="score">{s.quality}%</b></div><p>{s.description}</p><div className="grid3"><Info title="Type" text={s.type} /><Info title="Status" text={s.status} /><Info title="Token" text={'#' + s.tokenId} /></div><p><b>Source:</b> <span className="hash">{s.sourceUrl}</span></p><p><b>IPFS:</b> <span className="hash">{s.ipfs}</span></p><p><b>Owner:</b> <span className="hash">{s.owner}</span></p><div>{s.tags.map(t => <span className="tag" key={t}>{t}</span>)}</div></section>)}</div>; }

function MetadataUpdates({ state, setState, flash }) { const [id, setId] = useState(state.services[0]?.id || ''); const [note, setNote] = useState(''); const svc = state.services.find(s => s.id === id); const update = () => { if (!svc || !note) return flash('Select a record and enter an update note.'); const tx = rand('0x'); setState(s => ({ ...s, services: s.services.map(x => x.id === id ? { ...x, version: x.version + 1, tx, ipfs: 'ipfs://bafy' + rand('').slice(0, 32), history: [{ version: x.version + 1, date: now(), tx, note }, ...x.history] } : x), rewards: { ...s.rewards, claimable: s.rewards.claimable + 20, total: s.rewards.total + 20 }, rewardLedger: [{ date: now(), type: 'METADATA_UPDATE', item: svc.title, amount: 20, status: 'Credited' }, ...s.rewardLedger], auditLog: [{ date: now(), type: 'UPDATE', item: svc.title, tx, amount: '+20 GEOW' }, ...s.auditLog] })); flash('Metadata update recorded.'); }; return <section className="card"><h2>Metadata versioning</h2><label>Select record<select value={id} onChange={e => setId(e.target.value)}>{state.services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label><label>Update note<textarea value={note} onChange={e => setNote(e.target.value)} rows="4" placeholder="Describe metadata correction, license change, steward update, etc." /></label><button onClick={update}>Submit Metadata Update</button>{svc && <><h3>Version history</h3><Table rows={svc.history} /></>}</section>; }

function Rewards({ state, setState, flash }) { const claim = () => { if (!state.rewards.claimable) return flash('No claimable rewards.'); const amt = state.rewards.claimable; setState(s => ({ ...s, rewards: { ...s.rewards, claimable: 0 }, auditLog: [{ date: now(), type: 'CLAIM', item: 'RewardsEngine', tx: rand('0x'), amount: `-${amt} GEOW claimed` }, ...s.auditLog] })); flash('Rewards claimed in pilot mode.'); }; return <><div className="grid4"><Metric value={state.rewards.claimable} label="claimable GEOW" /><Metric value={state.rewards.total} label="total earned" /><Metric value={state.rewards.epoch} label="reward epoch" /><Metric value={state.rewards.usageEvents} label="validation events" /></div><section className="card"><h2>Rewards engine</h2><p>Rewards are credited for independent metadata registration, metadata updates, OSM mapping contributions, community verification, quality bonuses and approved faucet claims. Production should require admin/DAO approval before real payout.</p><button onClick={claim}>Claim GEOW</button><Table rows={state.rewardLedger} /></section></>; }
function OSMRewards({ state, setState, flash }) { const [f, setF] = useState({ osmUser: state.linkedAccounts.osm || '', changeset: '', area: 'Belize', contribution: 'Added or improved mapped features', features: 5 }); const change = e => setF({ ...f, [e.target.name]: e.target.value }); const submit = () => { if (!f.osmUser || !f.changeset) return flash('OSM username and changeset ID are required.'); const features = Number(f.features || 1); const q = Math.min(98, 65 + features * 3 + (f.contribution.length > 40 ? 10 : 0)); const reward = q >= 90 ? 75 : q >= 80 ? 50 : 25; const status = q >= 80 ? 'Approved for pilot' : 'Pending DAO review'; const claim = { id: 'osm-' + Date.now(), ...f, features, quality: q, reward, status };
 setState(s => ({ ...s, linkedAccounts: { ...s.linkedAccounts, osm: f.osmUser }, osmClaims: [claim, ...s.osmClaims], rewards: { ...s.rewards, claimable: s.rewards.claimable + reward, total: s.rewards.total + reward }, rewardLedger: [{ date: now(), type: 'OSM_REWARD', item: `OSM changeset ${f.changeset}`, amount: reward, status }, ...s.rewardLedger], auditLog: [{ date: now(), type: 'OSM_REWARD', item: `OSM changeset ${f.changeset}`, tx: rand('0x'), amount: `+${reward} GEOW` }, ...s.auditLog], proposals: status.includes('Pending') ? [{ id: 'dao-' + Date.now(), title: `Review OSM changeset ${f.changeset}`, item: f.area, status: 'Active', forVotes: 0, againstVotes: 0, detail: f.contribution }, ...s.proposals] : s.proposals })); flash('OSM reward submitted.'); };
 return <section className="card"><h2>OSM map rewards</h2><p>Reward useful OpenStreetMap changesets such as roads, buildings, shelters, schools, clinics, trails, protected-area facilities and disaster-response assets. Rewards should be quality reviewed, not purely quantity based.</p><div className="grid2"><div className="form"><label>OSM username<input name="osmUser" value={f.osmUser} onChange={change} /></label><label>Changeset ID<input name="changeset" value={f.changeset} onChange={change} /></label><label>Target area<input name="area" value={f.area} onChange={change} /></label><label>Feature count<input name="features" type="number" value={f.features} onChange={change} /></label><label>Contribution description<textarea name="contribution" value={f.contribution} onChange={change} rows="4" /></label><button onClick={submit}>Submit OSM Reward Claim</button></div><Table rows={state.osmClaims} /></div></section>; }
function ContributionFaucet({ state, setState, flash }) { const [f, setF] = useState({ claimant: state.user.id, serviceId: state.services[0]?.id || '', proof: '', address: '' }); const claim = () => { const svc = state.services.find(s => s.id === f.serviceId); if (!svc) return flash('Select a service.'); const reward = svc.quality >= 90 ? 15 : 10; const item = svc.title; setState(s => ({ ...s, faucetClaims: [{ id: 'faucet-' + Date.now(), claimant: f.claimant, item, proof: f.proof || 'Contribution proof supplied', reward, status: 'Pending admin review' }, ...s.faucetClaims], rewards: { ...s.rewards, claimable: s.rewards.claimable + reward, total: s.rewards.total + reward }, rewardLedger: [{ date: now(), type: 'CONTRIBUTION_FAUCET', item, amount: reward, status: 'Pending admin review' }, ...s.rewardLedger], auditLog: [{ date: now(), type: 'FAUCET', item, tx: rand('0x'), amount: `+${reward} GEOW` }, ...s.auditLog] })); flash('Contribution faucet claim submitted.'); };
 return <section className="card"><h2>GeoWeb3 contribution faucet</h2><p>The former Bitcoin/ArcGIS faucet has been generalized into a contribution faucet for verified geospatial work from non-Esri metadata, OSM, public datasets and community mapping.</p><div className="grid2"><div className="form"><label>Claimant / wallet<input value={f.claimant} onChange={e => setF({ ...f, claimant: e.target.value })} /></label><label>Record<select value={f.serviceId} onChange={e => setF({ ...f, serviceId: e.target.value })}>{state.services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label><label>Optional BTC/Lightning/payment memo<input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} /></label><label>Proof<textarea value={f.proof} onChange={e => setF({ ...f, proof: e.target.value })} rows="4" /></label><button onClick={claim}>Submit Faucet Claim</button></div><Table rows={state.faucetClaims} /></div></section>; }
function DAO({ state, setState, flash }) { const [p, setP] = useState({ title: '', item: state.services[0]?.title || '', detail: '' }); const create = () => { if (!p.title) return flash('Proposal title required.'); setState(s => ({ ...s, proposals: [{ id: 'dao-' + Date.now(), ...p, status: 'Active', forVotes: 0, againstVotes: 0 }, ...s.proposals] })); flash('DAO proposal created.'); }; const vote = (id, side) => setState(s => ({ ...s, proposals: s.proposals.map(x => x.id === id ? { ...x, forVotes: x.forVotes + (side === 'for' ? 1 : 0), againstVotes: x.againstVotes + (side === 'against' ? 1 : 0) } : x) })); return <><section className="card"><h2>Create verification proposal</h2><div className="grid2"><label>Title<input value={p.title} onChange={e => setP({ ...p, title: e.target.value })} /></label><label>Record / item<input value={p.item} onChange={e => setP({ ...p, item: e.target.value })} /></label></div><label>Details<textarea value={p.detail} onChange={e => setP({ ...p, detail: e.target.value })} rows="3" /></label><button onClick={create}>Create DAO Review</button></section><div className="cards">{state.proposals.map(x => <section className="card" key={x.id}><h2>{x.title}</h2><p>{x.detail}</p><p><b>Item:</b> {x.item}</p><div className="vote"><button onClick={() => vote(x.id, 'for')}>Vote For ({x.forVotes})</button><button className="secondary" onClick={() => vote(x.id, 'against')}>Vote Against ({x.againstVotes})</button></div></section>)}</div></>; }
function AuditLog({ state }) { return <section className="card"><h2>Audit / on-chain style log</h2><p>Production will sync actual blockchain transaction hashes, IPFS hashes and database events. This pilot view keeps a transparent local ledger for demos.</p><Table rows={state.auditLog} /></section>; }
function Compliance() { return <section className="card"><h2>Compliance and trust controls</h2><div className="grid2"><div><h3>Required labels</h3><ul><li>User-declared</li><li>Admin-reviewed</li><li>Community-reviewed</li><li>DAO-disputed</li><li>Agency-verified</li></ul></div><div><h3>Do not do</h3><ul><li>Do not claim official verification without an agency agreement.</li><li>Do not store private ArcGIS/Esri secrets in the frontend.</li><li>Do not reward unreviewed edits automatically in production.</li><li>Do not fetch arbitrary URLs without SSRF protection.</li></ul></div></div><div className="notice">This app is designed so meaningful production work can proceed as an outsider using public metadata, open standards and community verification.</div></section>; }
function ProductionReadiness() { return <section className="card"><h2>Production readiness checklist</h2><ol className="bigList"><li>Clean GitHub repository</li><li>Local build with npm install and npm run build</li><li>Vercel frontend connected to GitHub</li><li>vercel.json SPA rewrite</li><li>Public landing page</li><li>Backend on Render/Railway/Supabase functions</li><li>Postgres database</li><li>/api/health</li><li>/api/metadata/validate and /api/metadata/register</li><li>Database persistence</li><li>Pinata/IPFS metadata pinning</li><li>Polygon Amoy contract deployment</li><li>Contract addresses in frontend and backend env vars</li><li>Admin review dashboard</li><li>Pilot users and feedback loop</li></ol></section>; }
function Backup({ state, setState, flash }) { const exportData = () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'geoweb3-backup.json'; a.click(); URL.revokeObjectURL(a.href); }; const importData = e => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => { try { setState({ ...initialState, ...JSON.parse(r.result) }); flash('Backup imported.'); } catch { flash('Invalid JSON backup.'); } }; r.readAsText(file); }; return <section className="card"><h2>Export / Import</h2><p>Use this for browser-level pilot backup. Production should use Postgres backups and audit logs.</p><button onClick={exportData}>Export Backup JSON</button><label className="filePick">Import Backup JSON<input type="file" accept="application/json" onChange={importData} /></label></section>; }
function Table({ rows }) { if (!rows?.length) return <p className="muted">No records yet.</p>; const keys = Object.keys(rows[0]); return <div className="tableWrap"><table><thead><tr>{keys.map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{keys.map(k => <td key={k}>{Array.isArray(r[k]) ? r[k].join(', ') : String(r[k] ?? '')}</td>)}</tr>)}</tbody></table></div>; }
function simulateEvent(state, setState, flash) { setState(s => ({ ...s, rewards: { ...s.rewards, claimable: s.rewards.claimable + 5, total: s.rewards.total + 5, usageEvents: s.rewards.usageEvents + 1 }, auditLog: [{ date: now(), type: 'VALIDATION', item: 'Metadata validation event', tx: rand('0x'), amount: '+5 GEOW' }, ...s.auditLog] })); flash('Validation event simulated.'); }

createRoot(document.getElementById('root')).render(<App />);
