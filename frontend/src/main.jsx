import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const demoServices = [
  {
    id: 'svc-1001', tokenId: '1001', title: 'Belize Protected Areas Open Metadata Record', sourceType: 'GeoJSON', sourceUrl: 'https://example.org/open-data/belize-protected-areas.geojson',
    steward: 'Belize conservation data steward', license: 'CC-BY-4.0', verification: 'Community Verified', quality: 94, version: '3.0',
    owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', tx: '0x8f1a2d91d22f7843e120', ipfs: 'ipfs://bafybeigdyrztc4demo001',
    bbox: '-89.25, 15.80, -87.50, 18.50', srs: 'EPSG:4326', frequency: 'Quarterly',
    tags: ['Belize', 'protected areas', 'conservation', 'open metadata'],
    description: 'Independent non-Esri metadata record registered for provenance, discoverability, quality review and contributor rewards.',
    history: [
      { version: '3.0', date: '2026-06-06', note: 'License and verification update', tx: '0x8f1a2d91d22f7843e120' },
      { version: '2.0', date: '2026-06-05', note: 'Steward and contact update', tx: '0xbd910192e120' },
      { version: '1.0', date: '2026-06-05', note: 'Initial independent metadata registration', tx: '0xa8411140' }
    ]
  },
  {
    id: 'svc-1002', tokenId: '1002', title: 'Community Hurricane Shelter Points', sourceType: 'CSV', sourceUrl: 'https://example.org/shelters.csv',
    steward: 'Community emergency mapping group', license: 'Government Open Data License', verification: 'Admin Reviewed', quality: 87, version: '1.0',
    owner: '0x19E7e376E7C213B7E7e7E46cc70A5dD086DAff2A', tx: '0xc4f010ac8801', ipfs: 'ipfs://bafybeidemo002',
    bbox: '-89.05, 16.20, -87.90, 18.10', srs: 'EPSG:4326', frequency: 'Monthly', tags: ['shelters', 'disaster response', 'CSV'],
    description: 'CSV-based public metadata record for pilot shelter mapping and verification.', history: []
  }
];

const initialState = {
  user: null,
  active: 'dashboard',
  theme: 'neon',
  account: { wallet: '', email: '', osm: '', organization: '', verification: 'User-declared' },
  services: demoServices,
  rewards: { claimable: 285, total: 525, epoch: 37, target: 1000, rank: 8 },
  rewardLedger: [
    { date: '2026-06-05', type: 'METADATA_MINT', item: 'Belize Protected Areas Open Metadata Record', amount: '+100 GEOW', status: 'Credited' },
    { date: '2026-06-05', type: 'QUALITY_BONUS', item: 'Community metadata validation', amount: '+50 GEOW', status: 'Credited' },
    { date: '2026-06-06', type: 'OSM_REWARD', item: 'OSM changeset 149876543', amount: '+60 GEOW', status: 'Credited' },
    { date: '2026-06-06', type: 'FAUCET', item: 'Contribution Faucet pilot claim', amount: '+15 GEOW', status: 'Approved' }
  ],
  osmClaims: [
    { id: 'osm-001', osmUser: 'demo_mapper_bz', changeset: '149876543', area: 'Belize', contribution: 'Added hurricane shelter points and corrected road tags', features: 12, quality: 88, reward: 60, status: 'Approved' }
  ],
  faucetClaims: [
    { id: 'fc-001', claimant: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', source: 'Independent metadata record', proof: 'geo-contribution-demo-proof-001', reward: 15, status: 'Approved' }
  ],
  proposals: [
    { id: 'dao-001', title: 'Verify independent metadata claim', item: 'Belize Protected Areas Open Metadata Record', status: 'Active', forVotes: 14, againstVotes: 2, detail: 'Community verifies whether metadata, steward information, evidence and license are sufficient.' }
  ],
  txLog: [
    { date: '2026-06-05', type: 'MINT', item: 'Belize Protected Areas Open Metadata Record', hash: '0x8f1a2d91d22f7843e120', value: '+100 GEOW' },
    { date: '2026-06-05', type: 'DAO_REVIEW', item: 'Protected Areas verification', hash: '0x21c55103fda9b01e', value: '14 votes' },
    { date: '2026-06-06', type: 'OSM_REWARD', item: 'OSM changeset 149876543', hash: '0xc4f010ac8801', value: '+60 GEOW' }
  ]
};

const nav = [
  ['dashboard','Dashboard','▣'], ['submit','Submit Metadata','✦'], ['registry','My Registry','◈'], ['update','Metadata Updates','↻'], ['rewards','Rewards','◎'], ['osm','OSM Rewards','⌖'], ['faucet','Contribution Faucet','◇'], ['dao','DAO Review','◉'], ['log','On-Chain Log','☷'], ['account','Account Linking','◌'], ['compliance','Compliance','⚑'], ['production','Production','⚙'], ['backup','Backup','⇩']
];
const sourceTypes = ['OGC API Features','OGC WMS','OGC WFS','GeoJSON','CSV with latitude/longitude','GeoPackage','Shapefile / ZIP reference','OpenStreetMap changeset','Public API endpoint','Open-data portal page','Manual metadata-only record','Other non-Esri source'];
const licenses = ['CC-BY-4.0','CC0','Open Data Commons ODbL','Government Open Data License','Public domain','Custom license','Unknown / needs review'];
const today = () => new Date().toISOString().slice(0,10);
const randomHash = () => '0x' + Array.from(crypto.getRandomValues(new Uint8Array(10))).map(b => b.toString(16).padStart(2,'0')).join('');
const short = v => String(v || '').length > 24 ? String(v).slice(0,10) + '…' + String(v).slice(-8) : String(v || '');
const statusFromQuality = q => q >= 90 ? 'Community Verified' : q >= 80 ? 'Admin Reviewed' : 'Pending DAO Review';

function useStore(){
  const [state,setState] = useState(()=>{try{return {...initialState,...JSON.parse(localStorage.getItem('geoweb3.demoStyle.noEsri.v1')||'{}')}}catch{return initialState}});
  useEffect(()=>localStorage.setItem('geoweb3.demoStyle.noEsri.v1',JSON.stringify(state)),[state]);
  return [state,setState];
}
function App(){
  const [state,setState] = useStore();
  const [toast,setToast] = useState('');
  const flash = msg => { setToast(msg); setTimeout(()=>setToast(''),2600); };
  const login = kind => { setState(s=>({...s,user:{kind,id:kind==='Wallet'?randomHash():'demo.user@geoweb3.org'}})); flash('Connected to GeoWeb3 pilot mode.'); };
  if(!state.user) return <AuthScreen login={login} />;
  const Current = views[state.active] || Dashboard;
  return <div className={`app ${state.theme}`}>
    <Sidebar state={state} setState={setState} />
    <main className="main">
      <Topbar state={state} setState={setState} flash={flash} />
      <Current state={state} setState={setState} flash={flash} />
    </main>
    {toast && <div className="toast">{toast}</div>}
  </div>;
}
function AuthScreen({login}){
  const [emailBox,setEmailBox] = useState(false);
  return <div className="authWrap">
    <div className="orb orb1"/><div className="orb orb2"/>
    <section className="authPanel heroAuth">
      <span className="chip glow">GeoWeb3 • Service NFT Registry • No-Esri Mode</span>
      <h1>Register, verify and reward geospatial metadata outside the Esri platform.</h1>
      <p className="lead">A board-ready production MVP styled like the original GeoWeb3 dashboard: wallet/email onboarding, independent metadata submission, service NFT-style registry, rewards, OSM contributions, DAO review and transparent transaction logs.</p>
      <div className="heroStats"><Stat value="No-Esri" label="metadata workflow"/><Stat value="5-step" label="submission wizard"/><Stat value="GEOW" label="reward engine"/><Stat value="DAO" label="verification layer"/></div>
    </section>
    <section className="authPanel loginCard">
      <h2>Connect account</h2><p>Use demo wallet or email. Production can connect WalletConnect, Supabase/Auth0 and backend OTP.</p>
      <button onClick={()=>login('Wallet')}>Connect Web3 Wallet</button>
      <button className="secondary" onClick={()=>setEmailBox(!emailBox)}>Use Email / OTP</button>
      {emailBox && <div className="stack"><input placeholder="name@example.com"/><input placeholder="Demo OTP: 123456"/><button className="ghost" onClick={()=>login('Email')}>Verify OTP</button></div>}
      <div className="miniNote">Esri OAuth and private ArcGIS IDs are intentionally not required.</div>
    </section>
  </div>
}
function Sidebar({state,setState}){return <aside className="sidebar">
  <div className="brand"><div className="logo">G3</div><div><b>GeoWeb3</b><span>Service NFT Registry</span></div></div>
  <div className="walletCard"><span className="online"/> {state.user.kind}: <b>{short(state.user.id)}</b><small>Polygon Amoy • Pilot</small></div>
  <nav>{nav.map(([id,label,icon])=><button key={id} className={state.active===id?'active':''} onClick={()=>setState(s=>({...s,active:id}))}><span>{icon}</span>{label}</button>)}</nav>
  <div className="sideFoot"><b>No-Esri submission</b><p>Users submit metadata directly using open standards, OSM changesets, file references, public APIs or manual records.</p></div>
</aside>}
function Topbar({state,setState,flash}){return <header className="topbar"><div><p className="eyebrow">Production-style dashboard</p><h1>{nav.find(n=>n[0]===state.active)?.[1] || 'Dashboard'}</h1></div><div className="topActions"><select value={state.theme} onChange={e=>setState(s=>({...s,theme:e.target.value}))}><option value="neon">Neon Blue</option><option value="agency">Agency Slate</option><option value="green">Eco Green</option></select><button className="secondary" onClick={()=>simulate(state,setState,flash)}>Simulate event</button></div></header>}
function Stat({value,label}){return <div className="stat"><strong>{value}</strong><span>{label}</span></div>}
function Progress({value}){return <div className="progress"><span style={{width: `${Math.min(100,value)}%`}} /></div>}
function Badge({children,type=''}){return <span className={`badge ${type}`}>{children}</span>}

const views = { dashboard:Dashboard, submit:SubmitMetadata, registry:Registry, update:MetadataUpdates, rewards:Rewards, osm:OSMRewards, faucet:Faucet, dao:DAO, log:Log, account:Account, compliance:Compliance, production:Production, backup:Backup };

function Dashboard({state}){
  const verified = state.services.filter(s=>s.verification.includes('Verified') || s.verification.includes('Reviewed')).length;
  return <>
    <div className="kpis"><Stat value={state.services.length} label="registered records"/><Stat value={verified} label="verified/reviewed"/><Stat value={`${state.rewards.claimable} GEOW`} label="claimable balance"/><Stat value={state.proposals.length} label="DAO reviews"/></div>
    <section className="heroPanel"><div><Badge type="success">Live Vercel-ready MVP</Badge><h2>GeoWeb3 Independent Metadata Registry</h2><p>Styled to match the original demo-style dashboard while preserving the new requirement: users submit service metadata outside the Esri environment. The application keeps the original workflow feel: onboarding, minting-style metadata registration, ownership tracking, update history, rewards, DAO review and on-chain logs.</p></div><div className="chainCard"><span>Epoch progress</span><strong>{state.rewards.epoch}/{state.rewards.target}</strong><Progress value={(state.rewards.epoch/state.rewards.target)*100}/><small>Rank #{state.rewards.rank} in pilot leaderboard</small></div></section>
    <div className="grid2"><section className="card"><h2>Workflow overview</h2><div className="workflow"><div>Submit metadata</div><div>Validate source</div><div>Pin/IPFS snapshot</div><div>Mint registry record</div><div>Reward + review</div></div></section><section className="card"><h2>Feature parity restored</h2><ul className="checks"><li>Original-style dashboard and sidebar</li><li>Five-step minting/submission wizard</li><li>Service ownership cards with token IDs</li><li>Metadata update version history</li><li>Rewards engine and leaderboard feel</li><li>DAO verification and on-chain style log</li><li>OSM Rewards and generalized Contribution Faucet</li></ul></section></div>
    <section className="card"><h2>Recent registry records</h2><ServiceGrid services={state.services.slice(0,2)} /></section>
  </>;
}
function SubmitMetadata({state,setState,flash}){
  const [step,setStep] = useState(1);
  const [form,setForm] = useState({title:'',sourceType:'GeoJSON',sourceUrl:'',steward:'',contact:'',license:'CC-BY-4.0',bbox:'',srs:'EPSG:4326',frequency:'Quarterly',tags:'',description:'',evidence:''});
  const quality = useMemo(()=>Math.min(99, 55 + ['title','sourceUrl','steward','license','bbox','description','evidence'].filter(k=>String(form[k]||'').trim()).length*6),[form]);
  const submit = () => {
    const svc = { id:'svc-'+Date.now(), tokenId:String(1000+state.services.length+1), title:form.title || 'Untitled independent metadata record', sourceType:form.sourceType, sourceUrl:form.sourceUrl || 'manual://metadata-only', steward:form.steward || 'User-declared steward', license:form.license, verification:statusFromQuality(quality), quality, version:'1.0', owner:state.user.id, tx:randomHash(), ipfs:'ipfs://bafy-demo-'+Date.now(), bbox:form.bbox || 'Not supplied', srs:form.srs, frequency:form.frequency, tags:form.tags.split(',').map(x=>x.trim()).filter(Boolean), description:form.description, evidence:form.evidence, history:[{version:'1.0',date:today(),note:'Initial non-Esri metadata registration',tx:randomHash()}] };
    setState(s=>({...s,services:[svc,...s.services],rewards:{...s.rewards,claimable:s.rewards.claimable+100,total:s.rewards.total+100},rewardLedger:[{date:today(),type:'METADATA_MINT',item:svc.title,amount:'+100 GEOW',status:'Pending review'},...s.rewardLedger],txLog:[{date:today(),type:'MINT',item:svc.title,hash:svc.tx,value:'+100 GEOW'},...s.txLog]}));
    flash('Metadata record registered in pilot mode.'); setStep(5);
  };
  return <div className="wizardWrap"><section className="card"><h2>Five-step metadata registration</h2><p>This replaces Esri-centered service minting with a platform-neutral workflow. It keeps the demo feel but avoids ArcGIS organization IDs, private APIs and OAuth secrets.</p><div className="stepper">{['Source','Metadata','License','Verify','Mint'].map((s,i)=><button key={s} className={step===i+1?'active':''} onClick={()=>setStep(i+1)}><b>{i+1}</b>{s}</button>)}</div></section>
  <section className="card wizardCard">{step===1 && <><h2>1. Source URL or reference</h2><p className="muted">Submit any public or documented non-Esri source.</p><label>Source type<select value={form.sourceType} onChange={e=>setForm({...form,sourceType:e.target.value})}>{sourceTypes.map(x=><option key={x}>{x}</option>)}</select></label><label>Public URL, file reference, OSM changeset or manual source<input value={form.sourceUrl} onChange={e=>setForm({...form,sourceUrl:e.target.value})} placeholder="https://example.org/data.geojson or manual://metadata" /></label><button onClick={()=>setStep(2)}>Continue to metadata</button></>}
  {step===2 && <><h2>2. Metadata details</h2><div className="formGrid"><label>Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Data steward<input value={form.steward} onChange={e=>setForm({...form,steward:e.target.value})}/></label><label>Contact<input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})}/></label><label>Spatial reference<input value={form.srs} onChange={e=>setForm({...form,srs:e.target.value})}/></label><label>Bounding box<input value={form.bbox} onChange={e=>setForm({...form,bbox:e.target.value})} placeholder="minX, minY, maxX, maxY"/></label><label>Update frequency<input value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})}/></label></div><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><button onClick={()=>setStep(3)}>Continue to license</button></>}
  {step===3 && <><h2>3. License and ownership declaration</h2><label>License<select value={form.license} onChange={e=>setForm({...form,license:e.target.value})}>{licenses.map(x=><option key={x}>{x}</option>)}</select></label><label>Tags<input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="protected areas, open data, Belize"/></label><label>Evidence / proof statement<textarea value={form.evidence} onChange={e=>setForm({...form,evidence:e.target.value})} placeholder="Public data page, steward declaration, uploaded documentation, community proof..."/></label><div className="notice">Ownership is labeled as user-declared until reviewed by admin, community or a formal agency partner.</div><button onClick={()=>setStep(4)}>Run validation</button></>}
  {step===4 && <><h2>4. System verification preview</h2><div className="scoreBox"><strong>{quality}</strong><span>pilot quality score</span><Progress value={quality}/></div><ul className="checks"><li>Source/reference captured</li><li>No Esri private credential required</li><li>Metadata snapshot ready for IPFS pinning</li><li>Reward pending admin/DAO review</li></ul><pre>{JSON.stringify({...form, verification_status: statusFromQuality(quality), quality_score: quality}, null, 2)}</pre><button onClick={submit}>Mint / Register Metadata Record</button></>}
  {step===5 && <><h2>5. Confirmation</h2><div className="successBox"><strong>Metadata registered</strong><span>Registry card, reward ledger and on-chain style log were updated.</span></div><button onClick={()=>setStep(1)}>Register another record</button></>}</section></div>;
}
function ServiceGrid({services}){return <div className="serviceGrid">{services.map(s=><article className="serviceCard" key={s.id}><div className="serviceHead"><Badge type={s.verification.includes('Verified')?'success':'warn'}>{s.verification}</Badge><div className="token">#{s.tokenId}</div></div><h3>{s.title}</h3><p>{s.description}</p><div className="metaRows"><span>Type</span><b>{s.sourceType}</b><span>License</span><b>{s.license}</b><span>Version</span><b>{s.version}</b><span>Owner</span><b>{short(s.owner)}</b></div><div className="quality"><span>Quality</span><Progress value={s.quality}/><b>{s.quality}</b></div><div>{s.tags?.map(t=><Badge key={t}>{t}</Badge>)}</div><small className="hash">{s.ipfs}</small></article>)}</div>}
function Registry({state}){return <><section className="card"><h2>Registry / Ownership Tracking</h2><p>Original demo-style service cards are retained, but records are platform-neutral and do not depend on Esri infrastructure.</p></section><ServiceGrid services={state.services}/></>}
function MetadataUpdates({state,setState,flash}){const [id,setId]=useState(state.services[0]?.id||''); const svc=state.services.find(s=>s.id===id)||state.services[0]; const update=()=>{if(!svc)return;setState(s=>({...s,services:s.services.map(x=>x.id===svc.id?{...x,version:(parseFloat(x.version)+0.1).toFixed(1),history:[{version:(parseFloat(x.version)+0.1).toFixed(1),date:today(),note:'Metadata update submitted',tx:randomHash()},...(x.history||[])]}:x),rewards:{...s.rewards,claimable:s.rewards.claimable+25,total:s.rewards.total+25},txLog:[{date:today(),type:'UPDATE',item:svc.title,hash:randomHash(),value:'+25 GEOW'},...s.txLog]}));flash('Metadata version updated.');}; return <section className="card"><h2>Metadata Updates</h2><label>Select record<select value={id} onChange={e=>setId(e.target.value)}>{state.services.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label>{svc&&<><div className="updatePanel"><h3>{svc.title}</h3><p>Current version: <b>{svc.version}</b></p><textarea defaultValue={svc.description}/><button onClick={update}>Submit metadata update</button></div><h3>Version history</h3><Table rows={svc.history||[]}/></>}</section>}
function Rewards({state,setState,flash}){const claim=()=>{setState(s=>({...s,rewards:{...s.rewards,claimable:0},txLog:[{date:today(),type:'CLAIM',item:'GEOW rewards claim',hash:randomHash(),value:`${s.rewards.claimable} GEOW`},...s.txLog]}));flash('Rewards claimed in pilot mode.');};return <><div className="kpis"><Stat value={`${state.rewards.claimable} GEOW`} label="claimable"/><Stat value={`${state.rewards.total} GEOW`} label="earned total"/><Stat value={`#${state.rewards.rank}`} label="leaderboard rank"/><Stat value={`${state.rewards.epoch}`} label="epoch"/></div><section className="card"><h2>Rewards Engine</h2><p>Reward types include metadata minting, update rewards, usage bonuses, OSM rewards, quality bonuses and faucet approvals.</p><button onClick={claim}>Claim GEOW Rewards</button></section><section className="card"><h2>Reward ledger</h2><Table rows={state.rewardLedger}/></section></>}
function OSMRewards({state,setState,flash}){const [claim,setClaim]=useState({osmUser:'',changeset:'',area:'Belize',contribution:'',features:5});const q=Math.min(99,60+(claim.osmUser?8:0)+(claim.changeset?10:0)+(claim.contribution?10:0)+Math.min(10,Number(claim.features)||0));const submit=()=>{const row={id:'osm-'+Date.now(),...claim,quality:q,reward:q>=85?60:25,status:q>=85?'Approved':'Pending DAO Review'};setState(s=>({...s,osmClaims:[row,...s.osmClaims],rewardLedger:[{date:today(),type:'OSM_REWARD',item:`OSM changeset ${claim.changeset||'pending'}`,amount:`+${row.reward} GEOW`,status:row.status},...s.rewardLedger],rewards:{...s.rewards,claimable:s.rewards.claimable+row.reward,total:s.rewards.total+row.reward}}));flash('OSM reward claim submitted.');};return <><section className="card"><h2>OSM Map Rewards</h2><p>Reward verified OpenStreetMap contributions such as shelters, roads, buildings, clinics, tourism assets and protected-area features.</p><div className="formGrid"><label>OSM username<input value={claim.osmUser} onChange={e=>setClaim({...claim,osmUser:e.target.value})}/></label><label>Changeset ID<input value={claim.changeset} onChange={e=>setClaim({...claim,changeset:e.target.value})}/></label><label>Target area<input value={claim.area} onChange={e=>setClaim({...claim,area:e.target.value})}/></label><label>Number of features<input type="number" value={claim.features} onChange={e=>setClaim({...claim,features:e.target.value})}/></label></div><label>Contribution summary<textarea value={claim.contribution} onChange={e=>setClaim({...claim,contribution:e.target.value})}/></label><div className="scoreBox"><strong>{q}</strong><span>quality score</span><Progress value={q}/></div><button onClick={submit}>Submit OSM Reward Claim</button></section><section className="card"><h2>OSM claims</h2><Table rows={state.osmClaims}/></section></>}
function Faucet({state,setState,flash}){const [f,setF]=useState({source:'Independent metadata record',claimant:state.user.id,proof:'',reward:15});const submit=()=>{const row={id:'fc-'+Date.now(),...f,status:'Pending Review'};setState(s=>({...s,faucetClaims:[row,...s.faucetClaims],txLog:[{date:today(),type:'FAUCET_REQUEST',item:f.source,hash:randomHash(),value:`${f.reward} GEOW pending`},...s.txLog]}));flash('Contribution faucet claim submitted.');};return <><section className="card"><h2>Contribution Faucet</h2><p>The faucet is now generalized beyond ArcGIS. It can support verified independent metadata, OSM edits, GeoJSON/CSV records, open-data portal links and public API documentation.</p><div className="formGrid"><label>Contribution source<input value={f.source} onChange={e=>setF({...f,source:e.target.value})}/></label><label>Claimant wallet/email<input value={f.claimant} onChange={e=>setF({...f,claimant:e.target.value})}/></label><label>Requested GEOW<input type="number" value={f.reward} onChange={e=>setF({...f,reward:e.target.value})}/></label></div><label>Proof statement<textarea value={f.proof} onChange={e=>setF({...f,proof:e.target.value})}/></label><button onClick={submit}>Submit Faucet Claim</button></section><section className="card"><h2>Faucet ledger</h2><Table rows={state.faucetClaims}/></section></>}
function DAO({state,setState,flash}){const vote=(id,type)=>{setState(s=>({...s,proposals:s.proposals.map(p=>p.id===id?{...p,forVotes:p.forVotes+(type==='for'?1:0),againstVotes:p.againstVotes+(type==='against'?1:0)}:p),txLog:[{date:today(),type:'DAO_VOTE',item:id,hash:randomHash(),value:type},...s.txLog]}));flash('DAO vote logged.');};return <><section className="card"><h2>DAO Verification</h2><p>Use DAO/community review for metadata claims, ownership disputes, reward approvals and OSM quality checks.</p></section>{state.proposals.map(p=><section className="card proposal" key={p.id}><Badge type="warn">{p.status}</Badge><h2>{p.title}</h2><p>{p.detail}</p><p><b>Item:</b> {p.item}</p><div className="vote"><button onClick={()=>vote(p.id,'for')}>Vote For ({p.forVotes})</button><button className="secondary" onClick={()=>vote(p.id,'against')}>Vote Against ({p.againstVotes})</button></div></section>)}</>}
function Log({state}){return <section className="card"><h2>On-Chain / Audit Log</h2><p>Production will sync actual contract transaction hashes, IPFS hashes and database audit events. This view preserves the demo’s transparent blockchain-style transaction table.</p><Table rows={state.txLog}/></section>}
function Account({state,setState,flash}){const [a,setA]=useState(state.account);const save=()=>{setState(s=>({...s,account:a}));flash('Account links saved.');};return <section className="card"><h2>Account Linking</h2><p>Link wallet, email, OSM username and organization declaration without requiring Esri/ArcGIS OAuth.</p><div className="formGrid"><label>Wallet<input value={a.wallet} onChange={e=>setA({...a,wallet:e.target.value})}/></label><label>Email<input value={a.email} onChange={e=>setA({...a,email:e.target.value})}/></label><label>OSM username<input value={a.osm} onChange={e=>setA({...a,osm:e.target.value})}/></label><label>Organization declaration<input value={a.organization} onChange={e=>setA({...a,organization:e.target.value})}/></label></div><button onClick={save}>Save Account Links</button></section>}
function Compliance(){return <section className="card"><h2>Compliance and Trust Labels</h2><div className="grid2"><div><h3>Use these labels</h3><ul className="checks"><li>User-declared</li><li>Admin-reviewed</li><li>Community-verified</li><li>DAO-disputed</li><li>Agency-verified only after formal agreement</li></ul></div><div><h3>Avoid these risks</h3><ul className="checks"><li>No private ArcGIS IDs or secrets in frontend</li><li>No automatic payout for unreviewed work</li><li>No false ownership claims</li><li>No unsafe URL fetching without SSRF protection</li></ul></div></div><div className="notice">The platform can move forward as an outsider by using public metadata, open standards, community review and clear trust labels.</div></section>}
function Production(){return <section className="card"><h2>Production Readiness</h2><ol className="bigList"><li>Clean GitHub repository</li><li>Confirm local build with npm install and npm run build</li><li>Connect frontend to Vercel</li><li>Keep frontend/vercel.json SPA rewrite</li><li>Backend on Render/Railway/Supabase functions</li><li>Postgres database for users, services, rewards, DAO and audit logs</li><li>Pinata/IPFS metadata pinning</li><li>Polygon Amoy contract deployment</li><li>Contract addresses in frontend and backend environment variables</li><li>Admin review dashboard and anti-fraud controls</li><li>Pilot users and analytics feedback loop</li></ol><div className="notice">Vercel settings: Root Directory = frontend, Build Command = npm run build, Output Directory = dist.</div></section>}
function Backup({state,setState,flash}){const exportData=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='geoweb3-demo-style-backup.json';a.click();URL.revokeObjectURL(a.href)};const importData=e=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{setState({...initialState,...JSON.parse(r.result)});flash('Backup imported.')}catch{flash('Invalid backup file.')}};r.readAsText(file)};return <section className="card"><h2>Backup / Export</h2><p>Browser-level backup for demos. Production should use scheduled Postgres backups and immutable audit logs.</p><button onClick={exportData}>Export Backup JSON</button><label className="fileBtn">Import Backup JSON<input type="file" accept="application/json" onChange={importData}/></label></section>}
function Table({rows}){if(!rows?.length)return <p className="muted">No records.</p>;const keys=Object.keys(rows[0]);return <div className="tableWrap"><table><thead><tr>{keys.map(k=><th key={k}>{k}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{keys.map(k=><td key={k}>{Array.isArray(r[k])?r[k].join(', '):String(r[k]??'')}</td>)}</tr>)}</tbody></table></div>}
function simulate(state,setState,flash){setState(s=>({...s,rewards:{...s.rewards,claimable:s.rewards.claimable+5,total:s.rewards.total+5},txLog:[{date:today(),type:'VALIDATION',item:'Automated validation check',hash:randomHash(),value:'+5 GEOW'},...s.txLog]}));flash('Validation event simulated.');}

createRoot(document.getElementById('root')).render(<App/>);
