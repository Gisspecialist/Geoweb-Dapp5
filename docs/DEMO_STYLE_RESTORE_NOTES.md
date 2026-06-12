# Demo-Style GeoWeb3 Restore Notes

This build updates the restored No-Esri GeoWeb3 application so the dashboard, navigation, cards, wizard, rewards, DAO and transaction log feel closer to the reference GeoWeb3 demo dashboard at geoweb3-dapp-demo.vercel.app/dashboard.

## What changed
- More polished dark Web3 dashboard design.
- Sidebar navigation restored with original workflow areas.
- Dashboard KPI cards and epoch/leaderboard-style panel.
- Five-step Submit Metadata wizard that mirrors the earlier minting flow.
- Service NFT-style registry cards with token IDs, IPFS URI, owner, tx hash, quality score and verification label.
- Metadata update version history.
- Rewards engine and ledger.
- OSM Rewards module.
- Generalized Contribution Faucet.
- DAO Review module.
- On-chain / audit log table.
- Account linking, compliance, production checklist and backup screens.

## No-Esri principle retained
This build keeps the new requirement that metadata submission must work outside the Esri environment. It does not require ArcGIS organization IDs, Esri OAuth, private APIs, or sensitive Esri platform credentials. Supported sources include OGC API Features, WMS, WFS, GeoJSON, CSV, GeoPackage, shapefile/ZIP references, OSM changesets, public APIs, open-data portals and manual metadata records.

## Vercel settings
Root Directory: `frontend`
Build Command: `npm run build`
Output Directory: `dist`

The frontend includes `vercel.json` with SPA rewrites to reduce dashboard route 404 errors.
