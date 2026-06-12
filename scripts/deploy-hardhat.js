const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with:', deployer.address);

  const GEOW = await hre.ethers.getContractFactory('GEOWToken');
  const geow = await GEOW.deploy(deployer.address);
  await geow.waitForDeployment();

  const NFT = await hre.ethers.getContractFactory('ServiceNFT');
  const nft = await NFT.deploy(deployer.address);
  await nft.waitForDeployment();

  const Rewards = await hre.ethers.getContractFactory('RewardsEngine');
  const rewards = await Rewards.deploy(deployer.address, await geow.getAddress(), await nft.getAddress(), deployer.address);
  await rewards.waitForDeployment();

  const Faucet = await hre.ethers.getContractFactory('FaucetDistributor');
  const faucet = await Faucet.deploy(deployer.address, await geow.getAddress());
  await faucet.waitForDeployment();

  const OSM = await hre.ethers.getContractFactory('OSMRewardsRegistry');
  const osm = await OSM.deploy(deployer.address, await geow.getAddress());
  await osm.waitForDeployment();

  const DAO = await hre.ethers.getContractFactory('GeoDAOResolver');
  const dao = await DAO.deploy(deployer.address);
  await dao.waitForDeployment();

  await geow.setMinter(await rewards.getAddress(), true);
  await geow.setMinter(await faucet.getAddress(), true);
  await geow.setMinter(await osm.getAddress(), true);

  console.log({
    GEOWToken: await geow.getAddress(),
    ServiceNFT: await nft.getAddress(),
    RewardsEngine: await rewards.getAddress(),
    FaucetDistributor: await faucet.getAddress(),
    OSMRewardsRegistry: await osm.getAddress(),
    GeoDAOResolver: await dao.getAddress()
  });
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
