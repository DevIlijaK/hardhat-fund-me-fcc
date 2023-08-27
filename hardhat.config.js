require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-gas-reporter");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const LOCALHOST_RPC_URL = process.env.LOCALHOST_RPC_URL || "localhost";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key";

module.exports = {
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
    localhost: {
      url: LOCALHOST_RPC_URL,
      //accounts: automatic by hardhat
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
  },
};
