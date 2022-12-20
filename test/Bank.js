const {
	loadFixture,
	time,
} = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

function numEthInWei(num) {
	return ethers.utils.parseUnits(num.toString());
}

describe('Bank Contract', () => {
	async function deployContractFixture() {
		const [owner, user1, user2] = await ethers.getSigners();

		const contract = await ethers.getContractFactory('Bank');
		const BankContract = await contract.deploy();
		await BankContract.deployed();

		return { owner, user1, user2, BankContract };
	}

	describe('Success', () => {
		describe('Deploy Contract', async () => {
			it('deploys contract', async () => {
				const { BankContract } = await loadFixture(deployContractFixture);

				expect(BankContract.address).to.equal(
					'0x5FbDB2315678afecb367f032d93F642f64180aa3'
				);
			});
		});

		describe('Contract Transactions', () => {
			it('contract receives funds', async () => {
				const { user1, BankContract } = await loadFixture(
					deployContractFixture
				);

				let amount = numEthInWei(0.5);

				let tx = await BankContract.connect(user1).depositFunds({
					value: amount,
				});
				await tx.wait();

				expect(await BankContract.getContractBalance()).to.equal(amount);
			});

			it('reflects correct balance changes after deposits', async () => {
				const { user1, BankContract } = await loadFixture(
					deployContractFixture
				);

				let amount = numEthInWei(0.5);

				let tx = await BankContract.connect(user1).depositFunds({
					value: amount,
				});
				await tx.wait();

				await expect(
					BankContract.connect(user1).depositFunds({
						value: amount,
					})
				).to.changeEtherBalances(
					[BankContract, user1],
					[amount, numEthInWei(-0.5)]
				);

				expect(await BankContract.customerBalances(user1.address)).to.equal(
					numEthInWei(1)
				);
			});

			it('reflects balance changes after withdrawals', async () => {
				const { user1, BankContract } = await loadFixture(
					deployContractFixture
				);

				let tx = await BankContract.connect(user1).depositFunds({
					value: numEthInWei(1),
				});
				await tx.wait();

				await expect(
					BankContract.connect(user1).withdrawFunds(numEthInWei(0.5))
				).to.changeEtherBalances(
					[BankContract, user1],
					[numEthInWei(-0.5), numEthInWei(0.5)]
				);

				tx = await BankContract.connect(user1).withdrawFunds(numEthInWei(0.3));
				await tx.wait();

				expect(await BankContract.customerBalances(user1.address)).to.equal(
					numEthInWei(0.2)
				);
			});

			it('reflects balance changes after contract transfers', async () => {
				const { user1, user2, BankContract } = await loadFixture(
					deployContractFixture
				);

				let tx = await BankContract.connect(user1).depositFunds({
					value: numEthInWei(3),
				});
				await tx.wait();

				await expect(
					BankContract.connect(user1).transferFromBank(
						user2.address,
						numEthInWei(1.75)
					)
				).to.changeEtherBalances(
					[BankContract, user2],
					[numEthInWei(-1.75), numEthInWei(1.75)]
				);

				expect(await BankContract.customerBalances(user1.address)).to.equal(
					numEthInWei(1.25)
				);

				expect(await BankContract.customerBalances(user2.address)).to.equal(
					numEthInWei(1.75)
				);
			});

			it('updates "allTransactions" after successful transactions', async () => {
				const { BankContract, user1, user2 } = await loadFixture(
					deployContractFixture
				);

				let tx = await BankContract.connect(user1).depositFunds({
					value: numEthInWei(1),
				});
				await tx.wait();

				tx = await BankContract.connect(user1).transferFromBank(
					user2.address,
					numEthInWei(0.5)
				);
				await tx.wait();

				tx = await BankContract.connect(user1).withdrawFunds(numEthInWei(0.25));
				await tx.wait();

				expect((await BankContract.showAllTransactions()).length).to.equal(3);
			});
		});

		describe('Emits Appropriate Events', () => {
			it('emits "FundsDeposited" event', async () => {
				const { BankContract, user1 } = await loadFixture(
					deployContractFixture
				);

				await expect(
					BankContract.connect(user1).depositFunds({
						value: numEthInWei(1),
					})
				)
					.to.emit(BankContract, 'FundsDeposited')
					.withArgs(
						user1.address,
						numEthInWei(1),
						((await time.latest()) + 1).toString()
					);
			});

			it('emits "FundsWithdrawn" event', async () => {
				const { BankContract, user1 } = await loadFixture(
					deployContractFixture
				);

				let tx = await BankContract.connect(user1).depositFunds({
					value: numEthInWei(1),
				});
				await tx.wait();

				await expect(
					BankContract.connect(user1).withdrawFunds(numEthInWei(0.5))
				)
					.to.emit(BankContract, 'FundsWithdrawn')
					.withArgs(
						user1.address,
						numEthInWei(0.5),
						((await time.latest()) + 1).toString()
					);
			});

			it('emits "FundsTransferred" event', async () => {
				const { BankContract, user1, user2 } = await loadFixture(
					deployContractFixture
				);

				let tx = await BankContract.connect(user1).depositFunds({
					value: numEthInWei(1),
				});
				await tx.wait();

				await expect(
					BankContract.connect(user1).transferFromBank(
						user2.address,
						numEthInWei(0.75)
					)
				)
					.to.emit(BankContract, 'FundsTransferred')
					.withArgs(
						user1.address,
						user2.address,
						numEthInWei(0.75),
						((await time.latest()) + 1).toString()
					);
			});
		});
	});

	describe('Failure', () => {
		describe('Reject Transactions', () => {
			it('rejects withdrawals > deposited balance', async () => {
				const { BankContract, user1 } = await loadFixture(
					deployContractFixture
				);

				let tx = await BankContract.connect(user1).depositFunds({
					value: numEthInWei(2),
				});
				await tx.wait();

				await expect(BankContract.connect(user1).withdrawFunds(numEthInWei(3)))
					.to.be.reverted;
			});

			it('rejects transfers > deposited balance', async () => {
				const { BankContract, user1, user2 } = await loadFixture(
					deployContractFixture
				);

				let tx = await BankContract.connect(user1).depositFunds({
					value: numEthInWei(2),
				});
				await tx.wait();

				await expect(
					BankContract.connect(user1).transferFromBank(
						user2.address,
						numEthInWei(3)
					)
				).to.be.reverted;
			});

			it('rejects transfers to "0" accounts', async () => {
				const { BankContract, user1, user2 } = await loadFixture(
					deployContractFixture
				);

				let tx = await BankContract.connect(user1).depositFunds({
					value: numEthInWei(2),
				});
				await tx.wait();

				await expect(
					BankContract.connect(user1).transferFromBank(
						'0x0000000000000000000000000000000000000000',
						numEthInWei(3)
					)
				).to.be.revertedWith("Can't send funds to a '0' address");
			});
		});
	});
});
