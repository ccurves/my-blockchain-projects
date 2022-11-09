const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
  let simpleStorage, simpleStorageFactory;

  beforeEach(async function () {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
  });

  it("Should start with favourite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve();
    const expectedValue = "0";

    assert.equal(currentValue.toString(), expectedValue);
  });

  it("Should update when we call store", async function () {
    const expectedValue = "7";
    const transactionResponse = await simpleStorage.store(expectedValue);
    await transactionResponse.wait(1);

    const currentValue = await simpleStorage.retrieve();
    assert.equal(currentValue.toString(), expectedValue);
  });

  it("Should store people and their favourite number", async function () {
    const expectedName = "Simon";
    const expectedNumber = "30";
    const transactionResponse = await simpleStorage.addPerson(
      expectedName,
      expectedNumber
    );
    await transactionResponse.wait(1);

    const { name, favoriteNumber } = await simpleStorage.people(0);

    assert.equal(name, expectedName);
    assert.equal(favoriteNumber, expectedNumber);
  });
});
