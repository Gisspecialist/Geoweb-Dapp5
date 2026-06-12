# Independent Metadata Submission Mode

This version of GeoWeb3 supports geospatial metadata submission outside the Esri environment. Users do not need an ArcGIS organization, ArcGIS client ID, private service token, or Esri platform account to register a metadata record.

## Purpose

The application now treats GeoWeb3 as a platform-neutral geospatial metadata registry and rewards system. Users can submit metadata for public or community datasets using open standards and direct evidence rather than relying on Esri infrastructure.

## Supported submission sources

- OGC API Features
- OGC WMS
- OGC WFS
- GeoJSON
- CSV with latitude/longitude
- Shapefile or ZIP package reference
- GeoPackage
- OpenStreetMap changeset
- Public API endpoint
- Open-data portal page
- Manual metadata only
- Other non-Esri source

## Required metadata fields

Minimum required fields:

- Dataset or service title
- Description
- Data steward or contributor

Recommended fields:

- Public source URL or file reference
- Contact email or website
- License
- Spatial reference
- Bounding box
- Update frequency
- Tags / keywords
- Proof or evidence note

## Workflow

1. User connects with wallet or email/OTP.
2. User opens **Submit Metadata**.
3. User selects a non-Esri source type.
4. User enters the dataset/service metadata directly.
5. User optionally adds a public URL, OSM changeset, data portal link, or evidence note.
6. The app validates the metadata completeness.
7. Metadata is registered as an independent record.
8. A metadata snapshot is prepared for IPFS.
9. The record can be minted as a service metadata NFT.
10. Rewards, DAO review, admin review and faucet claims can reference the metadata record.

## Verification labels

Use clear labels to avoid overclaiming authority:

- User-declared
- Pending admin review
- Pending DAO review
- Community verified
- Agency verified, only when an agency has formally verified it
- Disputed
- Rejected

## Production requirements

Before public production, connect this workflow to:

- Backend metadata validation API
- Database persistence
- IPFS pinning
- Admin review dashboard
- DAO review workflow
- Polygon Amoy testnet contracts
- URL safety checks, including SSRF protection
- Duplicate detection by source URL and metadata hash
- Legal terms for user-declared metadata and rewards

## Important safety rule

The application should not claim that a metadata record is officially verified by an agency unless that agency has actually confirmed the record. Independent submission should be treated as user-declared or community-reviewed until formal verification is completed.
