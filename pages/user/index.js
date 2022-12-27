import Head from 'next/head';
import { useState, useEffect } from 'react';
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

	const bankContractAddress = '0x032C3529D23A2dee065CCcDbc93656425530D557';

	const weiToEth = num => ethers.utils.formatEther(num);

	const getEthInUsd = async () => {
		const response = await fetch(
			'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
		);
		const data = await response.json();
		const exchangeRate = data.USD;
		return exchangeRate;
	};

	useEffect(() => {
		async function getWalletBalance(address) {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const balance = await provider.getBalance(address);
			const balanceInEth = ethers.utils.formatEther(balance);
			const valueInUsd = await getEthInUsd();

			setEthBalance(Number(balanceInEth).toFixed(4));
			setUsdValue(valueInUsd);
		}

		const getUserBankBalance = async () => {
			console.log('getting user balance');

			try {
				const { ethereum } = window;

				if (ethereum) {
					const provider = new ethers.providers.Web3Provider(ethereum, 'any');
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
				}
			} catch (error) {
				console.log(error.message);
			}
		};

		if (user) {
			getUserBankBalance();
			setCurrentAccount(user.address);
			getWalletBalance(user.address);
		}
	}, [user, currentAccount]);

	return (
		<div className='page-container'>
			<Head>
				<title>Smart Bank | User</title>
				<meta name='description' content='Generated by create next app' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='flex flex-col rounded-xl justify-center items-center py-8 w-[80%] md:w-[70%] bg-gray-200 text-black'>
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
				<div className='grid grid-cols-3 gap-3'>
					<button className='btn'>
						<Link href={'/user/deposit'}>Deposit</Link>
					</button>
					<button className='btn'>
						<Link href={'/user/withdraw'}>Withdraw</Link>
					</button>
					<button className='btn'>
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
