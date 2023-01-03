import Link from 'next/link';
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

import abi from '../../abi/SmartBankABI.json';

function TxHistory({ user }) {
	const [currentAccount, setCurrentAccount] = useState('');

	// Import environment variables for Coinbase Wallet
	const baseUrl = process.env.NODE_ENDPOINT;
	const username = process.env.NODE_USERNAME;
	const password = process.env.NODE_PASSWORD;

	const router = useRouter();

	// GOERLI contract address
	const bankContractAddress = '0x032C3529D23A2dee065CCcDbc93656425530D557';

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
		const signer = provider.getSigner();
		const SmartBankContract = new ethers.Contract(
			bankContractAddress,
			abi,
			signer
		);

		const getDepositEvents = async () => {
			try {
				const eventsFilter = SmartBankContract.filters.FundsDeposited(
					user.address
				);

				const depositEvents = await SmartBankContract.queryFilter(eventsFilter);

				console.log(depositEvents);
			} catch (error) {
				console.log(error.message);
			}
		};

		getDepositEvents();
	}, [user.address, baseUrl, username, password, currentAccount]);

	return (
		<div className='page-container'>
			<main className='flex flex-col rounded-xl justify-center items-center py-8 w-[80%] md:w-[70%] bg-gray-200 text-black'>
				<button className='btn hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'>
					<Link href={'/user'}>Back</Link>
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

export default TxHistory;
