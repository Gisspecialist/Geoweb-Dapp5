// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
  GeoWeb3 production-oriented contracts.
  Uses OpenZeppelin in a real Hardhat/Foundry project:
  npm install @openzeppelin/contracts
*/

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GEOWToken is ERC20, Ownable {
    mapping(address => bool) public minters;
    constructor(address initialOwner) ERC20("GeoWeb3 Reward Token", "GEOW") Ownable(initialOwner) {}
    function setMinter(address account, bool allowed) external onlyOwner { minters[account] = allowed; }
    function mint(address to, uint256 amount) external { require(minters[msg.sender], "not minter"); _mint(to, amount); }
}

contract ServiceNFT is ERC721URIStorage, Ownable {
    struct VersionRecord {
        uint256 version;
        string tokenURIValue;
        bytes32 metadataHash;
        uint256 timestamp;
        address updatedBy;
    }
    uint256 public nextTokenId = 1000;
    mapping(uint256 => address) public serviceOwner;
    mapping(uint256 => VersionRecord[]) private versions;
    mapping(bytes32 => bool) public usedServiceUrlHash;

    event ServiceMinted(uint256 indexed tokenId, address indexed owner, bytes32 indexed serviceUrlHash, string tokenURIValue);
    event MetadataUpdated(uint256 indexed tokenId, uint256 indexed version, bytes32 metadataHash, string tokenURIValue);

    constructor(address initialOwner) ERC721("GeoWeb3 Service Ownership", "GEOSVC") Ownable(initialOwner) {}

    function mintService(address to, bytes32 serviceUrlHash, string calldata tokenURIValue, bytes32 metadataHash) external returns (uint256) {
        require(!usedServiceUrlHash[serviceUrlHash], "service already registered");
        uint256 tokenId = nextTokenId++;
        usedServiceUrlHash[serviceUrlHash] = true;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURIValue);
        serviceOwner[tokenId] = to;
        versions[tokenId].push(VersionRecord(1, tokenURIValue, metadataHash, block.timestamp, msg.sender));
        emit ServiceMinted(tokenId, to, serviceUrlHash, tokenURIValue);
        return tokenId;
    }

    function updateMetadata(uint256 tokenId, string calldata tokenURIValue, bytes32 metadataHash) external {
        require(_ownerOf(tokenId) != address(0), "missing token");
        require(ownerOf(tokenId) == msg.sender || getApproved(tokenId) == msg.sender || isApprovedForAll(ownerOf(tokenId), msg.sender), "not approved");
        _setTokenURI(tokenId, tokenURIValue);
        uint256 newVersion = versions[tokenId].length + 1;
        versions[tokenId].push(VersionRecord(newVersion, tokenURIValue, metadataHash, block.timestamp, msg.sender));
        emit MetadataUpdated(tokenId, newVersion, metadataHash, tokenURIValue);
    }

    function versionCount(uint256 tokenId) external view returns(uint256) { return versions[tokenId].length; }
    function getVersion(uint256 tokenId, uint256 index) external view returns(VersionRecord memory) { return versions[tokenId][index]; }
}

contract RewardsEngine is Ownable {
    GEOWToken public immutable geow;
    ServiceNFT public immutable serviceNFT;
    address public oracleSigner;
    mapping(bytes32 => bool) public consumedEvents;
    mapping(address => uint256) public earned;

    event RewardGranted(address indexed contributor, uint256 indexed tokenId, uint256 amount, string reason, bytes32 eventId);

    constructor(address initialOwner, address geowToken, address serviceNft, address oracle) Ownable(initialOwner) {
        geow = GEOWToken(geowToken);
        serviceNFT = ServiceNFT(serviceNft);
        oracleSigner = oracle;
    }

    function setOracleSigner(address oracle) external onlyOwner { oracleSigner = oracle; }

    function grantReward(address contributor, uint256 tokenId, uint256 amount, string calldata reason, bytes32 eventId) external onlyOwner {
        require(!consumedEvents[eventId], "event used");
        consumedEvents[eventId] = true;
        earned[contributor] += amount;
        geow.mint(contributor, amount);
        emit RewardGranted(contributor, tokenId, amount, reason, eventId);
    }
}


contract FaucetDistributor is Ownable {
    GEOWToken public immutable geow;
    mapping(bytes32 => bool) public usedClaims;
    uint256 public dailyLimit = 25;
    event FaucetClaimPaid(address indexed claimant, uint256 amount, bytes32 indexed claimId, string bitcoinOrLightningMemo);

    constructor(address initialOwner, address geowToken) Ownable(initialOwner) { geow = GEOWToken(geowToken); }
    function setDailyLimit(uint256 limit) external onlyOwner { dailyLimit = limit; }
    function payClaim(address claimant, uint256 amount, bytes32 claimId, string calldata bitcoinOrLightningMemo) external onlyOwner {
        require(!usedClaims[claimId], "claim used");
        usedClaims[claimId] = true;
        geow.mint(claimant, amount);
        emit FaucetClaimPaid(claimant, amount, claimId, bitcoinOrLightningMemo);
    }
}

contract GeoDAOResolver is Ownable {
    struct Proposal { string title; uint256 tokenId; string evidenceURI; uint256 forVotes; uint256 againstVotes; uint256 deadline; bool executed; }
    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public voted;
    event ProposalCreated(uint256 indexed id, uint256 indexed tokenId, string title);
    event VoteCast(uint256 indexed id, address indexed voter, bool support);

    constructor(address initialOwner) Ownable(initialOwner) {}
    function createProposal(string calldata title, uint256 tokenId, string calldata evidenceURI, uint256 votingSeconds) external returns(uint256) {
        proposals.push(Proposal(title, tokenId, evidenceURI, 0, 0, block.timestamp + votingSeconds, false));
        uint256 id = proposals.length - 1;
        emit ProposalCreated(id, tokenId, title);
        return id;
    }
    function vote(uint256 id, bool support) external {
        Proposal storage p = proposals[id];
        require(block.timestamp < p.deadline, "closed");
        require(!voted[id][msg.sender], "already voted");
        voted[id][msg.sender] = true;
        if(support) p.forVotes++; else p.againstVotes++;
        emit VoteCast(id, msg.sender, support);
    }
}

contract OSMRewardsRegistry is Ownable {
    GEOWToken public immutable geow;
    mapping(bytes32 => bool) public usedChangesets;
    event OSMRewardApproved(address indexed mapper, string osmUsername, string changesetId, uint256 amount, uint256 qualityScore, bytes32 indexed claimId);

    constructor(address initialOwner, address geowToken) Ownable(initialOwner) { geow = GEOWToken(geowToken); }

    function approveOSMReward(
        address mapper,
        string calldata osmUsername,
        string calldata changesetId,
        uint256 amount,
        uint256 qualityScore,
        bytes32 claimId
    ) external onlyOwner {
        require(!usedChangesets[claimId], "claim used");
        require(qualityScore >= 1 && qualityScore <= 100, "invalid score");
        usedChangesets[claimId] = true;
        geow.mint(mapper, amount);
        emit OSMRewardApproved(mapper, osmUsername, changesetId, amount, qualityScore, claimId);
    }
}
