// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require('hardhat');

const numEthInWei = num => ethers.utils.parseUnits(num.toString());
const readableEth = num => ethers.utils.formatEther(num).toLowerCase();

async function main() {
	//* ------------ HARDHAT Deployment Script
	// const [user1, user2, user3] = await ethers.getSigners();

	// const contract = await ethers.getContractFactory('SmartBank');
	// const SmartBankContract = await contract.deploy();
	// await SmartBankContract.deployed();

	// console.log(`SmartBankContract address: ${SmartBankContract.address}`);

	// // create transactions to populate data
	// //! -------- DEPOSITS --------
	// let tx = await SmartBankContract.depositFunds({ value: numEthInWei(4.5) });
	// await tx.wait();
	// console.log(
	// 	`deposited ${readableEth(
	// 		await SmartBankContract.customerBalances(user1.address)
	// 	)} ETH`
	// );

	// tx = await SmartBankContract.connect(user2).depositFunds({
	// 	value: numEthInWei(5),
	// });
	// await tx.wait();
	// console.log(
	// 	`deposited ${readableEth(
	// 		await SmartBankContract.customerBalances(user2.address)
	// 	)} ETH`
	// );

	// tx = await SmartBankContract.connect(user3).depositFunds({
	// 	value: numEthInWei(2.8),
	// });
	// await tx.wait();
	// console.log(
	// 	`deposited ${readableEth(
	// 		await SmartBankContract.customerBalances(user3.address)
	// 	)} ETH`
	// );

	// //! -------- WITHDRAWALS --------
	// tx = await SmartBankContract.withdrawFunds(numEthInWei(1.25));
	// await tx.wait();
	// console.log(`user1 withdrew 1.25 ETH`);

	// tx = await SmartBankContract.connect(user2).withdrawFunds(numEthInWei(3.39));
	// await tx.wait();
	// console.log(`user2 withdrew 3.39 ETH`);

	// //! -------- TRANSFERS --------
	// tx = await SmartBankContract.connect(user2).transferFromBank(
	// 	user3.address,
	// 	numEthInWei(1)
	// );
	// await tx.wait();
	// console.log(`user2 transferred 1 ETH`);

	// tx = await SmartBankContract.connect(user3).transferFromBank(
	// 	user1.address,
	// 	numEthInWei(0.75)
	// );
	// await tx.wait();
	// console.log(`user3 transferred 0.75 ETH`);

	// tx = await SmartBankContract.connect(user1).transferFromBank(
	// 	user3.address,
	// 	numEthInWei(1.4)
	// );
	// await tx.wait();
	// console.log(`user1 transferred 1.4 ETH`);

	//* ---------- GOERLI Deployment Script
	const contract = await ethers.getContractFactory('SmartBank');
	const SmartBankContract = await contract.deploy();
	await SmartBankContract.deployed();

	console.log(`SmartBankContract address: ${SmartBankContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
