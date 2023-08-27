const { network } = require("hardhat");
const { networkConfig, developmentChain } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // const ethUsdPriceFeedAdress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAdress;
  if (developmentChain.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAdress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAdress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  const args = [ethUsdPriceFeedAdress];

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, // put priceFeedAdress
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  console.log("Adresa: " + fundMe.address);
  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
};

module.exports.tags = ["all", "fundme"];
