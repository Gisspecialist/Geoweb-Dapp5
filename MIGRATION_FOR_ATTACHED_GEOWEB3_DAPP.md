# Migration Notes for the Attached GeoWeb3 DApp Archive

## Requested change

The current application should allow users to submit geospatial service metadata outside the Esri environment, avoiding reliance on the Esri platform, ArcGIS organization IDs, Esri OAuth, private ArcGIS APIs, or sensitive infrastructure credentials.

## Implementation approach

This package implements the requested change as a platform-neutral metadata registry. The application now treats Esri as optional future integration only; the core workflow does not need Esri.

## Files/directories to add or update in the existing app

If applying this change to the attached project repository, update or add the following areas:

### Frontend

- Replace the old Esri-centered minting screen with **Submit Metadata**.
- Add metadata form fields for title, description, steward, contact, license, spatial reference, bounding box, update frequency, tags, source URL/reference, and evidence.
- Add source type choices for OGC API Features, OGC WMS, OGC WFS, GeoJSON, CSV, GeoPackage, Shapefile/ZIP, OSM changeset, Public API, data portal, and Manual Metadata.
- Update navigation to include:
  - Submit Metadata
  - Registry / My Records
  - Metadata Updates
  - OSM Rewards
  - Contribution Faucet
  - DAO Verification
  - Audit / On-Chain Log

### Backend

- Add `POST /api/metadata/validate`.
- Add `POST /api/metadata/register`.
- Keep `POST /api/service/inspect` only as a generic public geospatial URL preview, not as an Esri-only flow.
- Remove Esri as a required dependency.
- Do not require `ESRI_CLIENT_ID`, `ESRI_CLIENT_SECRET`, or `ESRI_REDIRECT_URI` for the core application.

### Environment variables

Core independent metadata mode requires:

- `DATABASE_URL`
- `JWT_SECRET`
- `PINATA_JWT`
- `POLYGON_RPC_URL`
- contract addresses
- `ORACLE_SIGNER_PRIVATE_KEY`
- email/SMTP variables if OTP is enabled

It does not require Esri-specific secrets.

### Database

Add or adapt tables for independent metadata records, metadata versions, source evidence, verification status, DAO review, OSM rewards, and contribution faucet claims.

### Smart contracts

The existing ServiceNFT contract can still be used, but the token metadata should represent an independent geospatial metadata record rather than an ArcGIS-only service.

## Trust labels to use

- Independent / Non-Esri
- User-declared
- Pending Admin Review
- Pending DAO Review
- Community Verified
- Agency Verified, only when official approval exists

## Result

After this migration, GeoWeb3 becomes a vendor-neutral geospatial metadata and rewards registry. Users can participate without ArcGIS credentials, and agencies can still be added later as official verification partners.
