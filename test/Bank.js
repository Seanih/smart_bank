const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

function numTokensInWei(num) {
	return ethers.utils.parseUnits(num.toString());
}

describe('Bank Contract', () => {
	describe('Success', () => {
		async function deployContractFixture() {
			const [owner, user1, user2, user3] = await ethers.getSigners();

			const contract = await ethers.getContractFactory('Bank');
			const BankContract = await contract.deploy();
			await BankContract.deployed();

			return { owner, user1, user2, user3, BankContract };
		}

		describe('Deploy Contract', async () => {
			it('deploys contract', async () => {
				const { BankContract } = await deployContractFixture();

				expect(BankContract.address).to.equal(
					'0x5FbDB2315678afecb367f032d93F642f64180aa3'
				);
			});
		});

		describe('Contract Transactions', () => {
			it('contract receives funds', async () => {
				const { user1, BankContract } = await deployContractFixture();

				let amount = numTokensInWei(0.5);

				let tx = await BankContract.connect(user1).depositFunds({
					value: amount,
				});
				await tx.wait();

				expect(await BankContract.getContractBalance()).to.equal(amount);
			});

			it('reflects balance changes after deposits', async () => {
				const { user1, BankContract } = await deployContractFixture();

				let amount = numTokensInWei(0.5);

				await expect(
					BankContract.connect(user1).depositFunds({
						value: amount,
					})
				).to.changeEtherBalances(
					[BankContract, user1],
					[amount, numTokensInWei(-0.5)]
				);
			});

			it('reflects balance changes after withdrawals', async () => {
				const { user1, BankContract } = await deployContractFixture();

				let tx = await BankContract.connect(user1).depositFunds({
					value: numTokensInWei(0.5),
				});
				await tx.wait();

				await expect(
					BankContract.connect(user1).withdrawFunds(numTokensInWei(0.25))
				).to.changeEtherBalances(
					[BankContract, user1],
					[numTokensInWei(-0.25), numTokensInWei(0.25)]
				);
			});
		});
	});
});
