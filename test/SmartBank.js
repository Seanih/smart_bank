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

		const contract = await ethers.getContractFactory('SmartBank');
		const SmartBankContract = await contract.deploy();
		await SmartBankContract.deployed();

		return { owner, user1, user2, SmartBankContract };
	}

	describe('Success', () => {
		describe('Deploy Contract', async () => {
			it('deploys contract', async () => {
				const { SmartBankContract } = await loadFixture(deployContractFixture);

				console.log('goerli pk: ', process.env.GOERLI_DEV_PK)
				expect(SmartBankContract.address).to.equal(
					'0x5FbDB2315678afecb367f032d93F642f64180aa3'
				);
			});
		});

		describe('Contract Transactions', () => {
			it('contract receives funds', async () => {
				const { user1, SmartBankContract } = await loadFixture(
					deployContractFixture
				);

				let amount = numEthInWei(0.5);

				let tx = await SmartBankContract.connect(user1).depositFunds({
					value: amount,
				});
				await tx.wait();

				expect(await SmartBankContract.getContractBalance()).to.equal(amount);
			});

			it('reflects correct balance changes after deposits', async () => {
				const { user1, SmartBankContract } = await loadFixture(
					deployContractFixture
				);

				let amount = numEthInWei(0.5);

				let tx = await SmartBankContract.connect(user1).depositFunds({
					value: amount,
				});
				await tx.wait();

				await expect(
					SmartBankContract.connect(user1).depositFunds({
						value: amount,
					})
				).to.changeEtherBalances(
					[SmartBankContract, user1],
					[amount, numEthInWei(-0.5)]
				);

				expect(await SmartBankContract.customerBalances(user1.address)).to.equal(
					numEthInWei(1)
				);
			});

			it('reflects balance changes after withdrawals', async () => {
				const { user1, SmartBankContract } = await loadFixture(
					deployContractFixture
				);

				let tx = await SmartBankContract.connect(user1).depositFunds({
					value: numEthInWei(1),
				});
				await tx.wait();

				await expect(
					SmartBankContract.connect(user1).withdrawFunds(numEthInWei(0.5))
				).to.changeEtherBalances(
					[SmartBankContract, user1],
					[numEthInWei(-0.5), numEthInWei(0.5)]
				);

				tx = await SmartBankContract.connect(user1).withdrawFunds(numEthInWei(0.3));
				await tx.wait();

				expect(await SmartBankContract.customerBalances(user1.address)).to.equal(
					numEthInWei(0.2)
				);
			});

			it('reflects balance changes after contract transfers', async () => {
				const { user1, user2, SmartBankContract } = await loadFixture(
					deployContractFixture
				);

				let tx = await SmartBankContract.connect(user1).depositFunds({
					value: numEthInWei(3),
				});
				await tx.wait();

				await expect(
					SmartBankContract.connect(user1).transferFromBank(
						user2.address,
						numEthInWei(1.75)
					)
				).to.changeEtherBalances(
					[SmartBankContract, user2],
					[numEthInWei(-1.75), numEthInWei(1.75)]
				);

				expect(await SmartBankContract.customerBalances(user1.address)).to.equal(
					numEthInWei(1.25)
				);
			});

			it('updates "allTransactions" after successful transactions', async () => {
				const { SmartBankContract, user1, user2 } = await loadFixture(
					deployContractFixture
				);

				let tx = await SmartBankContract.connect(user1).depositFunds({
					value: numEthInWei(1),
				});
				await tx.wait();

				tx = await SmartBankContract.connect(user1).transferFromBank(
					user2.address,
					numEthInWei(0.5)
				);
				await tx.wait();

				tx = await SmartBankContract.connect(user1).withdrawFunds(numEthInWei(0.25));
				await tx.wait();

				expect((await SmartBankContract.showAllTransactions()).length).to.equal(3);
			});
		});

		describe('Emits Appropriate Events', () => {
			it('emits "FundsDeposited" event', async () => {
				const { SmartBankContract, user1 } = await loadFixture(
					deployContractFixture
				);

				await expect(
					SmartBankContract.connect(user1).depositFunds({
						value: numEthInWei(1),
					})
				)
					.to.emit(SmartBankContract, 'FundsDeposited')
					.withArgs(
						user1.address,
						numEthInWei(1),
						((await time.latest()) + 1).toString()
					);
			});

			it('emits "FundsWithdrawn" event', async () => {
				const { SmartBankContract, user1 } = await loadFixture(
					deployContractFixture
				);

				let tx = await SmartBankContract.connect(user1).depositFunds({
					value: numEthInWei(1),
				});
				await tx.wait();

				await expect(
					SmartBankContract.connect(user1).withdrawFunds(numEthInWei(0.5))
				)
					.to.emit(SmartBankContract, 'FundsWithdrawn')
					.withArgs(
						user1.address,
						numEthInWei(0.5),
						((await time.latest()) + 1).toString()
					);
			});

			it('emits "FundsTransferred" event', async () => {
				const { SmartBankContract, user1, user2 } = await loadFixture(
					deployContractFixture
				);

				let tx = await SmartBankContract.connect(user1).depositFunds({
					value: numEthInWei(1),
				});
				await tx.wait();

				await expect(
					SmartBankContract.connect(user1).transferFromBank(
						user2.address,
						numEthInWei(0.75)
					)
				)
					.to.emit(SmartBankContract, 'FundsTransferred')
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
				const { SmartBankContract, user1 } = await loadFixture(
					deployContractFixture
				);

				let tx = await SmartBankContract.connect(user1).depositFunds({
					value: numEthInWei(2),
				});
				await tx.wait();

				await expect(SmartBankContract.connect(user1).withdrawFunds(numEthInWei(3)))
					.to.be.reverted;
			});

			it('rejects transfers > deposited balance', async () => {
				const { SmartBankContract, user1, user2 } = await loadFixture(
					deployContractFixture
				);

				let tx = await SmartBankContract.connect(user1).depositFunds({
					value: numEthInWei(2),
				});
				await tx.wait();

				await expect(
					SmartBankContract.connect(user1).transferFromBank(
						user2.address,
						numEthInWei(3)
					)
				).to.be.reverted;
			});

			it('rejects transfers to "0" accounts', async () => {
				const { SmartBankContract, user1, user2 } = await loadFixture(
					deployContractFixture
				);

				let tx = await SmartBankContract.connect(user1).depositFunds({
					value: numEthInWei(2),
				});
				await tx.wait();

				await expect(
					SmartBankContract.connect(user1).transferFromBank(
						'0x0000000000000000000000000000000000000000',
						numEthInWei(3)
					)
				).to.be.revertedWith("Can't send funds to a '0' address");
			});
		});
	});
});
