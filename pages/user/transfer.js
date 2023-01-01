import Link from 'next/link';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

import abi from '../../abi/SmartBankABI.json';

import TransferModal from '../../components/TransferModal';
import LoadingModal from '../../components/LoadingModal';

function Transfer({ user }) {
	const [currentAccount, setCurrentAccount] = useState('');
	const [ethBalance, setEthBalance] = useState(0);
	const [usdValue, setUsdValue] = useState(0);
	const [transferAmt, setTransferAmt] = useState(0);
	const [toAddress, setToAddress] = useState('');
	const [depositedBalance, setDepositedBalance] = useState(0);
	const [showTransferModal, setShowTransferModal] = useState(false);
	const [showLoadingModal, setShowLoadingModal] = useState(false);
	const [txError, setTxError] = useState(false);
	const [addressError, setAddressError] = useState(false);

	// Import environment variables for Coinbase Wallet
	const baseUrl = process.env.NODE_ENDPOINT;
	const username = process.env.NODE_USERNAME;
	const password = process.env.NODE_PASSWORD;

	const router = useRouter();

	const numEthInWei = num => ethers.utils.parseEther(num.toString());
	const weiToEth = num => ethers.utils.formatEther(num.toString());

	const toggleTransferModal = () => {
		setTxError(false);
		setShowLoadingModal(false);
		setShowTransferModal(!showTransferModal);
	};

	// GOERLI contract address
	const bankContractAddress = '0x032C3529D23A2dee065CCcDbc93656425530D557';

	const getEthInUsd = async () => {
		const response = await fetch(
			'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
		);
		const data = await response.json();
		const exchangeRate = data.USD;
		return exchangeRate;
	};

	const validateAddress = address => {
		if (!addressError && !toAddress) {
			setAddressError(false);
		} else if (
			address[0] == '0' &&
			address[1] == 'x' &&
			toAddress.length === 42
		) {
			setAddressError(false);
		} else {
			setShowTransferModal(false);
			setAddressError(true);
		}
	};

	const transferEth = async () => {
		try {
			setTxError(false);
			setShowLoadingModal(true);

			const provider =
				new ethers.providers.Web3Provider(window.ethereum) ||
				new ethers.providers.JsonRpcProvider({
					url: baseUrl,
					user: username,
					password: password,
				});

			const signer = provider.getSigner();
			const SmartBankContract = new ethers.Contract(
				bankContractAddress,
				abi,
				signer
			);

			const transferTxn = await SmartBankContract.transferFromBank(
				toAddress,
				numEthInWei(transferAmt)
			);

			await transferTxn.wait();

			// reset states
			setTransferAmt(0);
			setToAddress('');

			router.push('/user');
		} catch (error) {
			toggleTransferModal();
			setTxError(true);
			console.log(error.message);
		}
	};

	useEffect(() => {
		async function getWalletBalance(address) {
			try {
				const provider =
					new ethers.providers.Web3Provider(window.ethereum) ||
					new ethers.providers.JsonRpcProvider({
						url: baseUrl,
						user: username,
						password: password,
					});

				const balance = await provider.getBalance(address);
				const balanceInEth = ethers.utils.formatEther(balance);
				const valueInUsd = await getEthInUsd();

				setEthBalance(Number(balanceInEth).toFixed(4));
				setUsdValue(valueInUsd);
			} catch (error) {
				console.log(error.message);
			}
		}

		const getUserBankBalance = async () => {
			try {
				const provider =
					new ethers.providers.Web3Provider(window.ethereum) ||
					new ethers.providers.JsonRpcProvider({
						url: baseUrl,
						user: username,
						password: password,
					});

				const signer = provider.getSigner();
				const SmartBankContract = new ethers.Contract(
					bankContractAddress,
					abi,
					signer
				);

				const userBankBalance = await SmartBankContract.customerBalances(
					currentAccount
				);

				setDepositedBalance(Number(weiToEth(userBankBalance)));
			} catch (error) {
				console.log(error.message);
			}
		};

		getUserBankBalance();
		setCurrentAccount(user.address);
		getWalletBalance(user.address);
	}, [user, currentAccount, baseUrl, username, password]);

	return (
		<div className='page-container'>
			<Head>
				<title>Smart Bank | Transfer</title>
				<meta name='description' content='Generated by create next app' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='flex flex-col rounded-xl justify-center items-center py-8 w-[90%] sm:w-[80%] md:w-[70%] bg-gray-200 text-black'>
				<h1 className='mb-4 font-semibold text-center'>
					<span className='font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-cyan-600 to-gray-700'>
						Smart Bank
					</span>{' '}
					Transfer
				</h1>
				<h2 className='text-center'>
					Connected Wallet:{' '}
					<span className='text-gray-600 font-bold'>
						{`${currentAccount.slice(0, 4)}...${currentAccount.slice(
							currentAccount.length - 4
						)}`}
					</span>
				</h2>
				<p className='pt-4'>
					Deposited ETH Balance:{' '}
					<span className='font-bold text-green-700'>{depositedBalance}</span>
				</p>
				<p className='pt-2'>
					Deposited USD Value: $
					<span className='font-bold text-green-700'>
						{(usdValue * depositedBalance).toFixed(2)}
					</span>
				</p>
				<div className='my-2 text-center flex flex-col'>
					<label htmlFor='depositAmount'>
						Transfer ETH Amount:
						<input
							type='number'
							className='bg-white rounded-md my-2 ml-2 border border-black text-center'
							value={transferAmt}
							min='0'
							onChange={e => setTransferAmt(e.target.value)}
						/>
					</label>
					<div className='relative'>
						<label htmlFor='transferTo'>
							Transfer To:
							<input
								type='text'
								className={`bg-white rounded-md pl-2 mb-2 ml-2 border ${
									addressError
										? 'border-red-600'
										: !addressError && toAddress.length === 42
										? 'border-green-500'
										: !addressError && !toAddress
										? 'border-black'
										: null
								} `}
								value={toAddress}
								minLength={10}
								placeholder='paste address here'
								onChange={e => {
									setToAddress(e.target.value);
									if (e.target.value.length > 0) {
										validateAddress(toAddress);
									}
								}}
								onBlur={() => validateAddress(toAddress)}
							/>
						</label>
						{addressError && (
							<span className='relative pl-2 text-red-600 text-sm'>
								invalid address
							</span>
						)}
					</div>
				</div>
				{txError && (
					<div className='mt-2 border border-red-600 w-[80%]'>
						<p className='px-4 text-center text-red-900'>
							The transaction was canceled or an error occured; please verify
							details and try again.
						</p>
					</div>
				)}
				<div className='h-[2px] w-[80%] bg-slate-500 my-4' />
				<div className='grid grid-cols-2 gap-4'>
					<button className='btn py-2 hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'>
						<Link href={'/user'}>Back</Link>
					</button>
					<button
						className='btn py-2'
						onClick={() => {
							validateAddress(toAddress);

							if (!addressError && toAddress.length === 42) {
								setShowTransferModal(true);
							}
						}}
					>
						Transfer
					</button>
				</div>
				<button
					className='btn py-2 mt-4 bg-red-400 hover:bg-red-600 hover:text-white'
					onClick={() => signOut({ redirect: '/signin' })}
				>
					Sign Out
				</button>
			</main>

			<TransferModal
				toAddress={toAddress}
				ethBalance={ethBalance}
				transferAmt={transferAmt}
				showTransferModal={showTransferModal}
				toggleTransferModal={toggleTransferModal}
				transferEth={transferEth}
				addressError={addressError}
			/>
			<LoadingModal txError={txError} showLoadingModal={showLoadingModal} />
		</div>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession(context);

	// redirect if not authenticated
	if (!session) {
		return {
			redirect: {
				destination: '/signin',
				permanent: false,
			},
		};
	}

	return {
		props: { user: session.user },
	};
}
export default Transfer;
