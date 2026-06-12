# GeoWeb3 Architecture

## Purpose

GeoWeb3 is now designed as a platform-neutral geospatial metadata registry and rewards DApp. The core workflow lets users submit metadata outside the Esri environment, register a trusted metadata record, store a snapshot through IPFS, mint or prepare a service metadata NFT, receive GEOW rewards, and use DAO/admin review for verification and disputes.

ArcGIS/Esri integration can still be added later as an optional adapter, but it is no longer required for the main application.

## Main flows

1. **Authentication**
   - Web3 wallet signs ownership and minting actions.
   - Email/OTP can identify non-crypto users.
   - No ArcGIS organization ID, ArcGIS private service token, or Esri client secret is required for independent metadata mode.

2. **Independent metadata submission**
   - User selects a source type such as OGC API Features, WMS, WFS, GeoJSON, CSV, GeoPackage, OSM changeset, public API, open-data portal page, or manual metadata.
   - User enters title, description, steward, contact, license, spatial reference, bounding box, update frequency, tags, source URL and evidence.
   - The record is labeled as independent / non-Esri.

3. **Metadata validation**
   - Backend checks required fields.
   - Optional public URL preview checks reachability and content type.
   - Production validation must include SSRF protection, duplicate detection, URL safety checks and license review.
   - Oracle signatures can be used to sign validated metadata events.

4. **Metadata + IPFS**
   - Metadata is structured as ERC-721 JSON with geospatial extensions.
   - Backend pins metadata to Pinata/IPFS.
   - The resulting CID becomes the token URI or registry metadata pointer.

5. **Minting / registration**
   - ServiceNFT can mint one metadata token for the metadata hash or source hash.
   - Duplicate source URLs, metadata hashes and spatial footprints should be checked.
   - Token ID, metadata CID, contributor account, steward, status and transaction hash become discoverable.

6. **Metadata versioning**
   - Owners or authorized stewards can update metadata.
   - Each update creates a version record, new IPFS CID and transaction or audit log entry.

7. **Rewards**
   - Independent metadata registration, valid metadata updates, community validation, OSM mapping work and DAO participation can generate GEOW.
   - Backend oracle signs reward events.
   - RewardsEngine mints or releases GEOW only after policy checks.

8. **DAO verification**
   - Community members vote on disputes, duplicate submissions, low-quality metadata, questionable evidence, OSM changesets and reward claims.

## Production components

- Frontend: React/Vite or static app using wallet connector and independent metadata forms.
- Backend: Express/FastAPI service for OTP, independent metadata validation, URL preview, IPFS, OSM reward checks, faucet claims and oracle signing.
- Smart contracts: GEOW ERC-20, ServiceNFT ERC-721, RewardsEngine, GeoDAOResolver, FaucetDistributor, OSMRewardsRegistry.
- Storage: PostgreSQL for indexed registry; IPFS for public immutable metadata snapshots.
- Chain: Polygon Amoy testnet for pilot, Polygon PoS after audit and legal review.

## OSM Map Rewards Extension

The application includes an OSM Map Rewards module. It supports public geospatial contribution rewards without needing private ArcGIS organization credentials. The OSM workflow links a user account/wallet to an OSM username, submits a changeset ID, scores the contribution, and routes the claim through admin/DAO review before rewards are issued.

This module shares the existing Rewards, DAO, Faucet and Audit Log workflows. Approved OSM claims create `OSM_REWARD` ledger entries and may also generate DAO proposals when quality score or evidence requires community review.

## Contribution Faucet

The previous Bitcoin/ArcGIS faucet idea is broadened into a GeoWeb3 Contribution Faucet. It can review claims for independent metadata records, OSM changesets, public data uploads, metadata corrections and community validation work. Real payouts should remain disabled until fraud controls, custody controls, tax/legal rules and payout procedures are finalized.
