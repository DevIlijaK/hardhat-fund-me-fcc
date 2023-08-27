const { deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = "1000000000000000000";

      beforeEach(async function () {
        deployer = await ethers.getSigners();
        console.log("Deplojer jeeee: ", deployer[0]);
        const deployedContracts = await deployments.fixture(["all"]);

        fundMe = await ethers.getContractAt(
          "FundMe",
          deployedContracts.FundMe.address
        );
        mockV3Aggregator = await ethers.getContractAt(
          "MockV3Aggregator",
          deployedContracts.MockV3Aggregator.address
        );

        console.log("Fund Me: ", fundMe);
        console.log("Mock: ", mockV3Aggregator);
      });

      describe("constructor", async function () {
        it("Sets the aggregator addresses correctly", async function () {
          const response = await fundMe.getPriceFeed();
          console.log("s_priceFeed: ", response);
          console.log("mockV3Aggregator", mockV3Aggregator);
          assert.equal(response, mockV3Aggregator.target);
        });
      });
      describe("fund", async function () {
        it("Fails if not enough ETH is send", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });
        it("Updated the amount funded data struucture", async function () {
          console.log("Deployer je: ", deployer[0].address);
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(
            deployer[0].address
          );
          assert.equal.apply(response.toString, sendValue.toString);
        });
        it("Adds funder to array of getFunder", async function () {
          console.log("Deployer je: ", deployer[0].address);
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer[0].address);
        });
      });
      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });
        it("withdraw ETH from a single founder", async function () {
          // Arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer[0].address
          );
          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;

          const gasCost = gasUsed * gasPrice;
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer[0].address
          );
          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            (startingFundMeBalance + startingDeployerBalance).toString(),
            (endingDeployerBalance + gasCost).toString()
          );
        });
        it("Cheaper withdraw ETH from a single founder", async function () {
          // Arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer[0].address
          );
          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;

          const gasCost = gasUsed * gasPrice;
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer[0].address
          );
          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            (startingFundMeBalance + startingDeployerBalance).toString(),
            (endingDeployerBalance + gasCost).toString()
          );
        });
        if (
          ("Allows us to withdtaw with multiple getFunder",
          async function () {
            // Arange
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
              const fundMeConnectedContract = await fundMe.connect(accounts[i]);
              await fundMeConnectedContract.fund({ value: sendValue });
            }
            const startingFundMeBalance = await ethers.provider.getBalance(
              fundMe.target
            );
            const startingDeployerBalance = await ethers.provider.getBalance(
              deployer[0].address
            );

            //Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, gasPrice } = transactionReceipt;

            const gasCost = gasUsed * gasPrice;

            //Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
              (startingFundMeBalance + startingDeployerBalance).toString(),
              (endingDeployerBalance + gasCost).toString()
            );

            // Make sure that the getFunder are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted;
            for (let i = 1; i < 6; i++) {
              assert.equal(
                await fundMe.getAddressToAmountFunded(accounts[i].address),
                0
              );
            }
          })
        );
        it("Only allows owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });

        if (
          ("Cheaper withdraw cheaper",
          async function () {
            // Arange
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
              const fundMeConnectedContract = await fundMe.connect(accounts[i]);
              await fundMeConnectedContract.fund({ value: sendValue });
            }
            const startingFundMeBalance = await ethers.provider.getBalance(
              fundMe.target
            );
            const startingDeployerBalance = await ethers.provider.getBalance(
              deployer[0].address
            );

            //Act
            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, gasPrice } = transactionReceipt;

            const gasCost = gasUsed * gasPrice;

            //Assert
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
              (startingFundMeBalance + startingDeployerBalance).toString(),
              (endingDeployerBalance + gasCost).toString()
            );

            // Make sure that the i_getFunder are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted;
            for (let i = 1; i < 6; i++) {
              assert.equal(
                await fundMe.getAddressToAmountFunded(accounts[i].address),
                0
              );
            }
          })
        );
      });
    });
