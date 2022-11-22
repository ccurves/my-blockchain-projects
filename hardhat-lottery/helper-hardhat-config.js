const networkConfig = {
  5: {
    name: "goerli",
    VRFCoordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
  },
  137: {
    name: "polygon",
    ethUsdPriceFeed: "0x73366Fe0AA0Ded304479862808e02506FE556a98",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
