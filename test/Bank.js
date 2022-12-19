const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

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
				console.log(`bank contract address: ${BankContract.address}`);
			});
		});
	});
});
