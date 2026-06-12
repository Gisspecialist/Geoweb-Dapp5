// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract GEOWTokenMock {
    string public name = "GeoWeb3 Reward Token";
    string public symbol = "GEOW";
    mapping(address => uint256) public balanceOf;
    event Rewarded(address indexed user, uint256 amount, string reason);
    function reward(address user, uint256 amount, string calldata reason) external { balanceOf[user] += amount; emit Rewarded(user, amount, reason); }
}

contract IndependentMetadataRegistry {
    struct Record { address owner; string metadataURI; string sourceType; string verificationStatus; uint256 version; }
    uint256 public nextTokenId = 1001;
    mapping(uint256 => Record) public records;
    event MetadataRegistered(uint256 indexed tokenId, address indexed owner, string metadataURI, string sourceType);
    event MetadataUpdated(uint256 indexed tokenId, uint256 version, string metadataURI);
    function registerMetadata(string calldata metadataURI, string calldata sourceType) external returns (uint256) { uint256 tokenId = nextTokenId++; records[tokenId] = Record(msg.sender, metadataURI, sourceType, "user_declared", 1); emit MetadataRegistered(tokenId, msg.sender, metadataURI, sourceType); return tokenId; }
    function updateMetadata(uint256 tokenId, string calldata metadataURI) external { require(records[tokenId].owner == msg.sender, "not owner"); records[tokenId].version += 1; records[tokenId].metadataURI = metadataURI; emit MetadataUpdated(tokenId, records[tokenId].version, metadataURI); }
}

contract OSMRewardsRegistry {
    event OSMClaimSubmitted(address indexed user, string osmUsername, string changesetId, string targetArea);
    function submitOSMClaim(string calldata osmUsername, string calldata changesetId, string calldata targetArea) external { emit OSMClaimSubmitted(msg.sender, osmUsername, changesetId, targetArea); }
}
