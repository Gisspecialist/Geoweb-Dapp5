# Smart Contracts

`GeoWeb3.sol` contains four contracts:

1. `GEOWToken` — ERC-20 reward token.
2. `ServiceNFT` — ERC-721 service ownership token with versioned metadata.
3. `RewardsEngine` — controlled reward minting for verified events.
4. `GeoDAOResolver` — DAO-style conflict and verification voting.

Deploy order:

1. GEOWToken
2. ServiceNFT
3. RewardsEngine using GEOWToken + ServiceNFT addresses
4. GeoDAOResolver
5. Call `GEOWToken.setMinter(RewardsEngine, true)`
