const { ethers } = require("hardhat");

async function getWeth() {
  // Create contract instance for WETH contract
  const weth = await ethers.getVerifiedContractAt(
    "0xd0a1e359811322d97991e03f863a0c30c2cf029c"
  );

  const value = ethers.utils.parseEther("0.01");
  const overrides = { value: value };
  const tx = await weth.deposit(overrides);

  return tx;
}

module.exports = getWeth;
