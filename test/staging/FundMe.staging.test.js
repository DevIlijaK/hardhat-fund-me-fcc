const { assert } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Funde me", async function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = "1000000000000000000";

      beforeEach(async function () {
        deployer = await ethers.getSigners();
        const deployedContracts = await deployments.fixture(["all"]);

        fundMe = await ethers.getContractAt(
          "FundMe",
          deployedContracts.FundMe.address
        );
        mockV3Aggregator = await ethers.getContractAt(
          "MockV3Aggregator",
          deployedContracts.MockV3Aggregator.address
        );
      });
      if (
        ("allows people to fund and withdraw",
        async function () {
          await fundMe.fund({ value: sendValue });
          await fundMe.withdraw();
          const endingBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          assert.equal(endingBalance.toString(), "0");
        })
      );
    });
