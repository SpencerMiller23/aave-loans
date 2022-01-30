/* eslint-disable no-unused-vars */
const { ethers } = require("hardhat");
const getWeth = require("./getWeth");

const amount = ethers.utils.parseEther("0.1");

async function main() {
    const network = await ethers.provider.getNetwork();
    const signer = await ethers.getSigners();
    let tokenAddress;

    if (network.name !== "kovan") {
        tokenAddress = process.env.WETH_TOKEN_MAINNET;
        getWeth();
    } else {
        tokenAddress = process.env.WETH_TOKEN_KOVAN;
    }
    const lendingPool = await getLendingPool();
    approveERC20(amount, lendingPool.address, tokenAddress, signer.address);
    console.log("Depositing WETH");
    const tx = await lendingPool.deposit(tokenAddress, amount, signer.address, 0);
    await tx.wait();
    console.log("Deposited WETH");
}

async function approveERC20(amount, spender, tokenAddress, account) {
    console.log(`approving ${amount} ${tokenAddress} to ${spender}`);
    const erc20 = await ethers.getVerifiedContractAt(tokenAddress);
    const tx = await erc20.connect(account).approve(spender, amount);
    await tx.wait();
    console.log(`approved ${amount} ${tokenAddress} to ${spender}`);
    return tx;
}

async function getLendingPool() {
  const network = await ethers.provider.getNetwork();
  const lendingPoolAddressProvider = await ethers.getVerifiedContractAt(
    network.name !== "kovan"
      ? process.env.LENDING_POOL_MAINNET
      : process.env.LENDING_POOL_KOVAN
  );

  const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
  const lendingPool = await ethers.getVerifiedContractAt(lendingPoolAddress);
  return lendingPool;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  });