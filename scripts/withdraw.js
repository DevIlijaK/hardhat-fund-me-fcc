const { getNamedAccount, getNamedAccounts } = require("hardhat");

async function main() {
  deployer = await ethers.getSigners();
  const deployedContracts = await deployments.fixture(["all"]);
  fundMe = await ethers.getContractAt(
    "FundMe",
    deployedContracts.FundMe.address
  );
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);
  console.log("Funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
