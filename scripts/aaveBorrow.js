/* eslint-disable no-unused-vars */
const { ethers } = require("hardhat");
const getWeth = require("./getWeth");

const amount = ethers.utils.parseEther("0.1");

async function main() {
    const network = await ethers.provider.getNetwork();
    const signer = await new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider);
    let tokenAddress;
    let daiEthPriceFeed;

    if (network.name !== "kovan") {
        tokenAddress = process.env.WETH_TOKEN_MAINNET;
        daiEthPriceFeed = process.env.DAI_ETH_PRICEFEED_MAINNET;
        await getWeth();
    } else {
        tokenAddress = process.env.WETH_TOKEN_KOVAN;
        daiEthPriceFeed = process.env.DAI_ETH_PRICEFEED_KOVAN;
    }
    const lendingPool = await getLendingPool();
    await approveERC20(amount, lendingPool.address, tokenAddress, signer);
    console.log("Depositing WETH");
    const tx = await lendingPool.deposit(tokenAddress, amount, signer.address, 0);
    await tx.wait();
    console.log("Deposited WETH");

    const [borrowableEth, totalDebt] = await getBorrowingData(lendingPool, signer.address);
    const daiEthPrice = await getAssetPrice(daiEthPriceFeed);
}

async function getAssetPrice(priceFeedAddress) {

}

async function getBorrowingData(lendingPool, account) {
  let [totalCollateralEth, totalDebtEth, availableBorrowEth, currentLiquidationThreshold, ltv, healthFactor] = lendingPool.getUserAccountData(account);
  totalCollateralEth = await ethers.utils.formatEther(totalCollateralEth);
  totalDebtEth = await ethers.utils.formatEther(totalDebtEth);
  availableBorrowEth = await ethers.utils.formatEther(availableBorrowEth);

  console.log(`Total collateral: ${totalCollateralEth}`);
  console.log(`Total debt: ${totalDebtEth}`);
  console.log(`Total available eth to borrow: ${availableBorrowEth}`);
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