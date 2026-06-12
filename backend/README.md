# GeoWeb3 Backend Scaffold

This backend supports the latest independent metadata workflow. It allows users to register geospatial metadata outside the Esri environment and avoids requiring ArcGIS organization IDs, private service tokens, or sensitive Esri API credentials.

## Main capabilities

- Email/OTP verification
- Independent metadata validation
- Independent metadata registration payloads
- Optional public URL preview checks
- IPFS JSON pinning
- Reward/oracle event signing
- OSM user and changeset reward scaffolding
- Contribution faucet claim review scaffolding

## Key endpoints

```text
GET  /health
POST /api/metadata/validate
POST /api/metadata/register
POST /api/service/inspect
POST /api/ipfs/pin-json
POST /api/rewards/sign-event
GET  /api/osm/user/:username
GET  /api/osm/changesets/:username
POST /api/osm/verify-changeset
POST /api/osm/rewards/submit
POST /api/faucet/claim
GET  /api/faucet/status
```

`/api/service/inspect` is retained as a generic/legacy helper. Production use should prefer `/api/metadata/validate` and `/api/metadata/register` for non-Esri metadata submission.

## Production note

Before using user-supplied URLs in production, add SSRF protection, private IP blocking, protocol allowlisting, content-size limits, timeout limits and duplicate detection.
