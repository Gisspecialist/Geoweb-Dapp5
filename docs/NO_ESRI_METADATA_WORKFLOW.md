# GeoWeb3 Independent Metadata Workflow (No Esri Platform Required)

## Purpose

This build changes the application so users submit geospatial service metadata directly to GeoWeb3 instead of relying on Esri/ArcGIS organization credentials, private ArcGIS infrastructure IDs, Esri OAuth, or sensitive ArcGIS API access.

The core registry now accepts platform-neutral metadata for public geospatial assets and services. The source can be an open-data page, OGC service, GeoJSON, CSV, GeoPackage, OpenStreetMap changeset, public API endpoint, shapefile/ZIP reference, or a manual metadata-only record.

## What changed

- The user-facing workflow is now **Submit Metadata**, not Esri service minting.
- Users can register metadata outside the Esri environment.
- Esri client IDs, client secrets, organization IDs, and private ArcGIS endpoints are not required.
- The registry uses neutral trust labels such as `Independent / Non-Esri`, `User-declared`, `Pending Admin Review`, `Pending DAO Review`, and `Community Verified`.
- The backend exposes `/api/metadata/validate` and `/api/metadata/register` for independent metadata validation and registration.
- OSM Map Rewards and the GeoWeb3 Contribution Faucet remain part of the application.

## Supported metadata sources

- OGC API Features
- OGC WMS
- OGC WFS
- GeoJSON
- CSV with latitude/longitude
- GeoPackage
- Shapefile/ZIP reference
- OpenStreetMap changeset
- Public API endpoint
- Public open-data portal page
- Manual metadata-only records
- Other non-Esri geospatial sources

## Minimum required user inputs

- Title
- Description
- Steward or organization name

## Recommended user inputs

- Public source URL or file reference
- Contact email or website
- License
- Spatial reference
- Bounding box
- Update frequency
- Tags
- Evidence or proof note

## Verification model

Because the system is intentionally not using private Esri infrastructure, verification is based on transparent evidence and review.

Suggested labels:

- `User-declared`: the user supplied the metadata.
- `Pending Admin Review`: a platform reviewer must confirm the record.
- `Pending DAO Review`: the community should vote on the record.
- `Community Verified`: the record has been reviewed through the pilot process.
- `Agency Verified`: reserved for future official agency approval.

## Production requirements

Before launching this workflow publicly, add:

1. Database persistence for metadata records.
2. IPFS pinning for metadata snapshots.
3. Admin review dashboard.
4. URL safety checks to prevent SSRF.
5. Duplicate detection using URL, title, steward, and spatial hash.
6. DAO review for disputed or low-confidence records.
7. Audit log for all submissions and updates.
8. Testnet smart-contract minting on Polygon Amoy.
9. Clear disclaimers that independent records are not official agency certifications unless specifically verified.

## Important security note

If the backend fetches user-submitted URLs, it must block local/internal network addresses, cloud metadata endpoints, non-HTTP protocols, and private IP ranges. Do not fetch arbitrary user URLs in production without SSRF protection.
