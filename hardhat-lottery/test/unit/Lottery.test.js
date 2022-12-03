const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Lottery Unit Test", async function () {
      let lottery, vrfCoordinatorV2Mock, chainId, lotteryEntranceFee, interval;
      chainId = network.config.chainId;
      let { deployer } = await getNamedAccounts();

      beforeEach(async function () {
        await deployments.fixture(["all"]);
        lottery = await ethers.getContract("Lottery", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        lotteryEntranceFee = await lottery.getEntranceFee();
        interval = await lottery.getInterval();
      });

      describe("constructor", async function () {
        it("Intializes the lottery correctly", async function () {
          //Remember Ideally you should have just 1 assert per "it" statement
          const lotteryState = await lottery.getLotteryState();

          assert.equal(lotteryState.toString(), "0");
          assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
        });
      });

      describe("enterLottery", async function () {
        it("reverts when you don't pay the entrance fee amount", async function () {
          await expect(lottery.enterLottery()).to.be.revertedWithCustomError(
            lottery,
            "Lottery__InsufficentETHEntered"
          );
        });

        it("records players when they enter lottery", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          const playerFromContract = await lottery.getPlayer(0);

          assert.equal(playerFromContract, deployer);
        });

        it("emits event on enter", async function () {
          await expect(
            lottery.enterLottery({ value: lotteryEntranceFee })
          ).to.emit(lottery, "LotteryEnter");
        });

        it("doesn't allow entrance when lottery is calculating", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);

          //Mock Chainlink Keeper and send random word
          await lottery.performUpkeep([]);
          await expect(
            lottery.enterLottery({ value: lotteryEntranceFee })
          ).to.be.revertedWithCustomError(lottery, "Lottery__NotOpen");
        });
      });

      describe("checkUpkeep", async function () {
        it("returns false if no one has sent any ETH", async function () {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]);
          assert(!upkeepNeeded);
        });

        it("returns false if lottery isn't open", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          await lottery.performUpkeep([]);
          const lotteryState = await lottery.getLotteryState();
          const { upkeepNeeded } = await lottery.callStatic.checkUpkeep([]);
          assert.equal(lotteryState.toString(), "1");
          assert.equal(upkeepNeeded, false);
        });
      });

      describe("performUpkeep", function () {
        it("can only run if checkupkeep is true", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const tx = await lottery.performUpkeep([]);
          assert(tx);
        });

        it("reverts when checkUpkeep is false", async function () {
          await expect(lottery.performUpkeep([])).to.be.revertedWithCustomError(
            lottery,
            "Lottery__UpkeepNotNeeded"
          );
        });

        it("updates the lottery state, emits an event and calls the vrf coordinator", async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const txResponse = await lottery.performUpkeep([]);
          const txReciept = await txResponse.wait(1);
          const requestId = txReciept.events[1].args.requestId;
          const lotteryState = await lottery.getLotteryState();
          assert(requestId.toNumber() > 0);
          assert(lotteryState.toString() == "1");
        });
      });
      describe("fulfillRandomWords", function () {
        beforeEach(async function () {
          await lottery.enterLottery({ value: lotteryEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
        });

        it("can only be called after performUpkeep", async function () {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, lottery.address)
          ).to.be.revertedWith("nonexistent request");
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, lottery.address)
          ).to.be.revertedWith("nonexistent request");
        });
        it("picks a winner, resets the lottery, and send winnings", async function () {
          const additionalPlayers = 3;
          const startingAcctIndex = 1;
          const accounts = await ethers.getSigners();
          for (
            let i = startingAcctIndex;
            i < startingAcctIndex + additionalPlayers;
            i++
          ) {
            const accountConnectedLottery = lottery.connect(accounts[i]);
            await accountConnectedLottery.enterLottery({
              value: lotteryEntranceFee,
            });
          }
          const startingTimeStamp = await lottery.getLatestTimeStamp();

          console.log(startingTimeStamp);

          await new Promise(async (resolve, reject) => {
            lottery.once("WinnerPicked", async () => {
              try {
                const recentWinner = await lottery.getRecentWinner();
                console.log(recentWinner);
                console.log(accounts[2].address);
                console.log(accounts[0].address);
                console.log(accounts[1].address);
                console.log(accounts[3].address);
                const lotteryState = await lottery.getLotteryState();
                const endingTimeStamp = await lottery.getLatestTimeStamp();
                const numPlayers = await lottery.getNumOfPlayers();
                assert.equal(numPlayers.toString(), "0");
                assert.equal(lotteryState.toString(), "0");
                assert(endingTimeStamp > startingTimeStamp);
              } catch (e) {
                reject(e);
              }
              resolve();
            });
            const tx = await lottery.performUpkeep([]);
            const txReciept = await tx.wait(1);
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReciept.events[1].args.requestId,
              lottery.address
            );
            // const winnerStartingBalance = await accounts[1].getBalance();
          });
        });
      });
    });
