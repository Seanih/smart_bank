import Link from 'next/link';
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

import abi from '../../abi/SmartBankABI.json';

import DepositModal from '../../components/DepositModal';
import LoadingModal from '../../components/LoadingModal';

function Deposit({ user }) {
	const [currentAccount, setCurrentAccount] = useState('');
	const [ethBalance, setEthBalance] = useState(0);
	const [usdValue, setUsdValue] = useState(0);
	const [depositAmt, setDepositAmt] = useState(0);
	const [showDepositModal, setShowDepositModal] = useState(false);
	const [showLoadingModal, setShowLoadingModal] = useState(false);
	const [txError, setTxError] = useState(false);
	const [network, setNetwork] = useState(null);

	// Import environment variables for Coinbase Wallet
	const baseUrl = process.env.NODE_ENDPOINT;
	const username = process.env.NODE_USERNAME;
	const password = process.env.NODE_PASSWORD;

	// GOERLI contract address
	const bankContractAddress = '0x032C3529D23A2dee065CCcDbc93656425530D557';

	const router = useRouter();

	const numEthInWei = num => ethers.utils.parseEther(num.toString());

	function addCommasToNum(n) {
		return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	const toggleDepositModal = () => {
		setTxError(false);
		setShowLoadingModal(false);
		setShowDepositModal(!showDepositModal);
	};

	const getEthInUsd = async () => {
		const response = await fetch(
			'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
		);
		const data = await response.json();
		const exchangeRate = data.USD;
		return exchangeRate;
	};

	const handleCompareAddresses = useCallback(async () => {
		try {
			const provider =
				new ethers.providers.Web3Provider(window.ethereum) ||
				new ethers.providers.JsonRpcProvider({
					url: baseUrl,
					user: username,
					password: password,
				});

			let signer = provider.getSigner();
			let address = await signer.getAddress();

			if (address !== user.address) {
				router.push('/signin');
			}
		} catch (error) {
			// will error on initial render since the browser won't be detected; no action required
		}
	}, [user.address, baseUrl, username, password, router]);

	const depositEth = async () => {
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

			const depositTxn = await SmartBankContract.depositFunds({
				value: numEthInWei(depositAmt),
			});

			await depositTxn.wait();

			// reset states
			setDepositAmt(0);

			router.push('/user');
		} catch (error) {
			toggleDepositModal();
			setTxError(true);
		}
	};

	//* hydrate the page
	useEffect(() => {
		const provider =
			new ethers.providers.Web3Provider(window.ethereum) ||
			new ethers.providers.JsonRpcProvider({
				url: baseUrl,
				user: username,
				password: password,
			});

		async function getWalletBalance(address) {
			try {
				const balance = await provider.getBalance(address);
				const balanceInEth = ethers.utils.formatEther(balance);
				const valueInUsd = await getEthInUsd();

				setEthBalance(Number(balanceInEth).toFixed(4));
				setUsdValue(valueInUsd);
			} catch (error) {}
		}

		const getNetwork = async () => {
			try {
				const walletNetwork = await provider.getNetwork();
				setNetwork(walletNetwork.name);
			} catch (error) {}
		};

		handleCompareAddresses();
		getNetwork();
		setCurrentAccount(user.address);
		getWalletBalance(user.address);
	}, [user, baseUrl, password, username, handleCompareAddresses]);

	//* detect network changes
	useEffect(() => {
		const provider =
			new ethers.providers.Web3Provider(window.ethereum) ||
			new ethers.providers.JsonRpcProvider({
				url: baseUrl,
				user: username,
				password: password,
			});

		const checkNetworkChange = async () => {
			try {
				const currentNetwork = await provider.getNetwork();
				if (currentNetwork.name !== network) {
					setNetwork(currentNetwork.name);
					window.location.reload();
				}
			} catch (error) {
				console.error(error.message);
				window.location.reload();
			}
		};
		const interval = setInterval(checkNetworkChange, 1000);
		return () => clearInterval(interval);
	});

	return (
		<div className='absolute page-container'>
			<Head>
				<title>Smart Bank | Deposit</title>
				<meta name='description' content='smart bank deposit page' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='flex flex-col rounded-xl justify-center items-center py-8 w-[90%] sm:w-[80%] md:w-[70%] bg-gray-200 text-black text-center'>
				<h1 className='mb-4 font-semibold'>
					<span className='font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-cyan-600 to-gray-700'>
						Smart Bank
					</span>{' '}
					Deposit
				</h1>
				<h2>
					Connected Wallet:{' '}
					<span className='font-bold text-gray-600'>
						{`${currentAccount.slice(0, 4)}...${currentAccount.slice(
							currentAccount.length - 4
						)}`}
					</span>
				</h2>
				<p className='pt-4'>
					Wallet ETH Balance:{' '}
					<span className='font-bold text-green-700'>{ethBalance}</span>
				</p>
				<p className='pt-2'>
					Wallet USD Value: $
					<span className='font-bold text-green-700'>
						{addCommasToNum((usdValue * ethBalance).toFixed(2))}
					</span>
				</p>
				<div className='my-2'>
					<label htmlFor='depositAmount'>
						Deposit ETH Amount:
						<input
							type='number'
							className='ml-2 text-center bg-white border border-black rounded-md'
							value={depositAmt}
							min='0'
							onChange={e => setDepositAmt(e.target.value)}
						/>
					</label>
				</div>

				{/* ------ tx error notice ------- */}
				{txError && (
					<div className='mt-2 border border-red-600 w-[80%]'>
						<p className='px-4 text-red-900'>
							The transaction was canceled or an error occured; please verify
							details and try again.
						</p>
					</div>
				)}
				{/* ------ tx error notice ------- */}

				<div className='h-[2px] w-[80%] bg-slate-500 my-4' />
				<div className='grid grid-cols-3 gap-1 px-2 xs:gap-2 xs:px-0'>
					<Link
						href={'/user'}
						className='py-2 btn underline hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'
					>
						Back
					</Link>

					<button
						className='py-2 btn'
						onClick={() => {
							handleCompareAddresses();
							toggleDepositModal();
						}}
					>
						Deposit
					</button>

					<Link
						href={'/user/dephistory'}
						className='py-2 btn underline hover:bg-gradient-to-br from-green-700 via-cyan-600 to-green-700'
					>
						History
					</Link>
				</div>
				<button
					className='mt-4 bg-red-400 btn hover:bg-red-600 hover:text-white'
					onClick={() => signOut({ redirect: '/signin' })}
				>
					Sign Out
				</button>
			</main>

			<DepositModal
				currentAccount={currentAccount}
				ethBalance={ethBalance}
				depositAmt={depositAmt}
				showDepositModal={showDepositModal}
				toggleDepositModal={toggleDepositModal}
				depositEth={depositEth}
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
export default Deposit;
