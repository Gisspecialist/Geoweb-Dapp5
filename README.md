# GeoWeb3 DApp — Independent Metadata + OSM Rewards Production MVP

This package rebuilds the GeoWeb3 DApp as a platform-neutral geospatial metadata registry and rewards system. The latest requirement is that users must be able to submit service metadata outside the Esri environment, avoiding dependence on Esri platform accounts, organization IDs, private APIs, OAuth client secrets, or sensitive agency infrastructure.

## What changed in this version

- New **Submit Metadata** workflow for independent, non-Esri metadata registration
- ArcGIS/Esri is no longer required for the core workflow
- Users can manually submit metadata and evidence directly inside GeoWeb3
- Supported source types include OGC API Features, OGC WMS/WFS, GeoJSON, CSV, GeoPackage, public APIs, OpenStreetMap changesets, open-data portal pages and manual metadata
- The app validates metadata completeness before registration
- The registry labels records as independent / non-Esri and tracks steward, contact, license, spatial reference, bounding box, evidence, tags and update frequency
- The contribution faucet now applies to general geospatial contributions, not only ArcGIS
- OSM Rewards remains part of the application for mapping contribution rewards

## Package contents

```text
frontend/                 Static runnable MVP demo
backend/                  Express backend scaffold for independent metadata, OTP, IPFS, OSM rewards, faucet claims and oracle signing
contracts/                Solidity ERC-20, ERC-721, RewardsEngine, DAO Resolver, Faucet Distributor and OSM registry scaffold
scripts/deploy-hardhat.js Hardhat deployment script
docs/ARCHITECTURE.md      System architecture and workflows
docs/METADATA_SCHEMA.json ERC-721 geospatial metadata schema
docs/INDEPENDENT_METADATA_SUBMISSION.md New non-Esri metadata workflow
docs/OSM_REWARDS_INTEGRATION.md Production plan for OSM changeset reward workflow
```

## Quick frontend demo

```bash
cd frontend
python -m http.server 8080
```

Open:

```text
http://localhost:8080
```

Use **Submit Metadata** to register a metadata record without ArcGIS or Esri credentials.

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

Useful backend endpoints:

```text
POST /api/metadata/validate
POST /api/metadata/register
POST /api/service/inspect          legacy/generic inspection helper
POST /api/ipfs/pin-json
POST /api/rewards/sign-event
GET  /api/osm/user/:username
GET  /api/osm/changesets/:username
POST /api/osm/verify-changeset
POST /api/osm/rewards/submit
POST /api/faucet/claim
GET  /api/faucet/status
```

## Production path

1. Store submitted metadata in Postgres.
2. Pin metadata snapshots to IPFS.
3. Deploy contracts to Polygon Amoy.
4. Add admin review before rewards are approved.
5. Add DAO review for disputes and low-confidence records.
6. Add duplicate detection by source URL, metadata hash and spatial footprint.
7. Use OSM/public data validation where available.
8. Keep Esri OAuth as an optional future adapter only, not a requirement.

## Important trust labels

Do not overstate verification. Use labels such as:

```text
User-declared
Pending admin review
Pending DAO review
Community verified
Agency verified
Disputed
Rejected
```

Only use **Agency verified** when an agency formally confirms the metadata record.
