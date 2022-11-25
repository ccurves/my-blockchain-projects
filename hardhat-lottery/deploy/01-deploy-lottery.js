const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address;

  if (developmentChains.includes(network.name)) {
    const vrfV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address - vrfV2Mock;
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]["VRFCoordinator"];
  }

  const entranceFee = networkConfig[chainId]["entranceFee"];
  const gasLane = networkConfig[chainId]["gasLane"];
  const args = [vrfCoordinatorV2Address, entranceFee, gasLane];
  const lottery = await deploy("Lottery", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations,
  });
};
