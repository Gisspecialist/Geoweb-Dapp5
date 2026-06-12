# GeoWeb3 DApp — Independent Metadata + OSM Rewards Production MVP

This package updates the GeoWeb3 DApp so users can submit geospatial service metadata **outside the Esri environment**. The core workflow does not require ArcGIS organization IDs, Esri OAuth, private Esri APIs, Esri client secrets, or any sensitive Esri platform credentials.

## What this version does

- Lets users submit platform-neutral geospatial metadata directly.
- Supports OGC API Features, OGC WMS/WFS, GeoJSON, CSV with latitude/longitude, GeoPackage, shapefile/ZIP references, public API endpoints, open-data portal pages, OSM changesets, and manual metadata-only records.
- Keeps OSM Map Rewards as a contribution-reward module.
- Keeps the GeoWeb3 Contribution Faucet for reviewed geospatial contributions.
- Uses neutral trust labels such as `Independent / Non-Esri`, `User-declared`, `Pending Admin Review`, `Pending DAO Review`, and `Community Verified`.
- Includes backend scaffolding for independent metadata validation and registration.
- Includes Solidity contract scaffolding for ServiceNFT, GEOW rewards, DAO verification, faucet distribution, and OSM reward registration.

## Quick frontend test

```bash
cd frontend
python -m http.server 8080
```

Open:

```text
http://localhost:8080
```

Use the **Submit Metadata** section after login.

## Backend test

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:8787/health
```

## Key backend routes

```text
POST /api/metadata/validate
POST /api/metadata/register
POST /api/service/inspect
POST /api/ipfs/pin-json
POST /api/osm/verify-changeset
POST /api/osm/rewards/submit
POST /api/faucet/claim
GET  /api/faucet/status
```

## Applying this to the attached GeoWeb3 DApp archive

See:

```text
MIGRATION_FOR_ATTACHED_GEOWEB3_DAPP.md
```

## Production notes

For a real deployment, connect:

- Vercel frontend
- Render/Railway/Supabase backend
- Supabase/Neon/Railway Postgres database
- Pinata/Filebase IPFS pinning
- Polygon Amoy testnet contracts
- Admin review dashboard
- DAO/community review
- URL safety and SSRF protection
- Sentry/Vercel Analytics/PostHog monitoring

The most important product change is that GeoWeb3 is now a **vendor-neutral geospatial metadata registry**, not an Esri-dependent application.
