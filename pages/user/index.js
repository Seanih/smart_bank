import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { getSession, signOut } from 'next-auth/react';
import abi from '../../abi/SmartBankABI.json';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useRouter } from 'next/router';

// gets a user prop from getServerSideProps
function User({ user }) {
	const [currentAccount, setCurrentAccount] = useState('');
	const [ethBalance, setEthBalance] = useState(0);
	const [usdValue, setUsdValue] = useState(0);
	const [depositedBalance, setDepositedBalance] = useState(0);

	// GOERLI contract address
	const bankContractAddress = '0x032C3529D23A2dee065CCcDbc93656425530D557';

	// Import environment variables for Coinbase Wallet
	const baseUrl = process.env.NODE_ENDPOINT;
	const username = process.env.NODE_USERNAME;
	const password = process.env.NODE_PASSWORD;

	const weiToEth = num => ethers.utils.formatEther(num);

	const getEthInUsd = async () => {
		const response = await fetch(
			'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
		);
		const data = await response.json();
		const exchangeRate = data.USD;
		return exchangeRate;
	};

	const router = useRouter();

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
			router.push('/signin');
		}
	}, [user.address, baseUrl, username, password, router]);

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
			} catch (error) {
				console.log(error.message);
			}
		}

		const getUserBankBalance = async () => {
			try {
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

		handleCompareAddresses();
		getUserBankBalance();
		setCurrentAccount(user.address);
		getWalletBalance(user.address);
	}, [
		user,
		currentAccount,
		baseUrl,
		username,
		password,
		handleCompareAddresses,
	]);

	return (
		<div className='page-container'>
			<Head>
				<title>Smart Bank | User</title>
				<meta name='description' content='Generated by create next app' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='flex flex-col rounded-xl justify-center items-center py-8 w-[90%] sm:w-[80%] md:w-[70%] bg-gray-200 text-black text-center'>
				<h1 className='mb-4'>
					Welcome to{' '}
					<span className='font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-cyan-600 to-gray-700'>
						Smart Bank
					</span>
				</h1>
				<h2>
					Connected Wallet:{' '}
					<span className='text-gray-600 font-bold'>
						{`${currentAccount.slice(0, 4)}...${currentAccount.slice(
							currentAccount.length - 4
						)}`}
					</span>
				</h2>
				<p className='pt-4'>
					Wallet ETH Balance:{' '}
					<span className='font-bold text-green-700'>{ethBalance}</span>
				</p>
				<p>
					Wallet USD Value: $
					<span className='font-bold text-green-700'>
						{(usdValue * ethBalance).toFixed(2)}
					</span>
				</p>
				<p className='pt-4'>
					Deposited ETH Balance:{' '}
					<span className='font-bold text-green-700'>{depositedBalance}</span>
				</p>
				<p>
					Deposited USD Value: $
					<span className='font-bold text-green-700'>
						{(usdValue * depositedBalance).toFixed(2)}
					</span>
				</p>
				<div className='h-[2px] w-[80%] bg-slate-500 my-4' />
				<p className='py-5'>Which service would you like to use?</p>
				<div className='grid grid-cols-3 gap-1 sm:gap-3 px-1'>
					<button className='btn py-2 flex justify-center text-sm sm:text-base'>
						<Link href={'/user/deposit'}>Deposit</Link>
					</button>
					<button className='btn py-2 flex justify-center text-sm sm:text-base'>
						<Link href={'/user/withdraw'}>Withdraw</Link>
					</button>
					<button className='btn py-2 flex justify-center text-sm sm:text-base'>
						<Link href={'/user/transfer'}>Transfer</Link>
					</button>
				</div>
				{/*  --------------------------  */}
				<button
					className='btn py-2 mt-4 bg-red-400 hover:bg-red-600 hover:text-white'
					onClick={() => signOut({ redirect: '/signin' })}
				>
					Sign Out
				</button>
			</main>
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

export default User;
