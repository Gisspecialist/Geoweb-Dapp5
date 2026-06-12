# GeoWeb3 Backend — Independent Metadata Mode

This backend is configured so GeoWeb3 can accept geospatial metadata outside the Esri platform.

## Core routes

- `GET /health` — confirms backend status.
- `POST /api/otp/send` — demo email OTP generation.
- `POST /api/otp/verify` — demo OTP verification.
- `POST /api/metadata/validate` — validates platform-neutral metadata.
- `POST /api/metadata/register` — prepares an independent metadata registration payload.
- `POST /api/service/inspect` — generic public geospatial URL preview.
- `POST /api/ipfs/pin-json` — demo or Pinata IPFS pinning.
- `GET /api/osm/user/:username` — OSM user-linking placeholder.
- `GET /api/osm/changesets/:username` — OSM changeset placeholder.
- `POST /api/osm/verify-changeset` — OSM quality/reward preview.
- `POST /api/osm/rewards/submit` — submits an OSM reward claim.
- `POST /api/faucet/claim` — submits a contribution faucet claim.
- `GET /api/faucet/status` — returns faucet status.

## Esri is not required

This backend intentionally does not require Esri OAuth or private ArcGIS credentials. If an agency later wants official Esri verification, add it as an optional plugin outside the core metadata workflow.

## Security before production

Before making `/api/service/inspect` public, add SSRF protection:

- Block localhost and loopback addresses.
- Block private IP ranges.
- Block cloud metadata endpoints.
- Allow only `http` and `https`.
- Add fetch timeouts.
- Add rate limiting.
- Validate response content types.
