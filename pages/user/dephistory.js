import Link from 'next/link';
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

import abi from '../../abi/SmartBankABI.json';

function DepHistory({ user }) {
	const [depositTxs, setDepositTxs] = useState([]);

	//set up pagination logic for tx data
	const [page, setPage] = useState(1);
	const pageSize = 10;
	const startIndex = (page - 1) * pageSize;
	const recentTxs = depositTxs.slice(startIndex, startIndex + pageSize);

	// Import environment variables for Coinbase Wallet
	const baseUrl = process.env.NODE_ENDPOINT;
	const username = process.env.NODE_USERNAME;
	const password = process.env.NODE_PASSWORD;

	const router = useRouter();

	// GOERLI contract address
	const bankContractAddress = '0x032C3529D23A2dee065CCcDbc93656425530D557';

	const readableEthAmt = num => ethers.utils.formatEther(num);
	const readableTime = num => new Date(num * 1000).toLocaleString();

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

				setDepositTxs(
					depositEvents.sort((a, b) => b.blockNumber - a.blockNumber)
				);
			} catch (error) {
				// UI will show no deposits have been made
			}
		};

		handleCompareAddresses();
		getDepositEvents();
	}, [user.address, baseUrl, username, password, handleCompareAddresses]);

	return (
		<div className='page-container'>
			<Head>
				<title>Smart Bank | Deposit History</title>
				<meta name='description' content='smart bank deposit history page' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='flex flex-col rounded-xl justify-center items-center py-8 xs:w-[90%] sm:w-[80%] md:w-[70%] bg-gray-200 text-black overflow-auto'>
				<h2 className='mb-2 font-semibold'>Deposit History</h2>
				{recentTxs.length > 0 ? (
					<div className='overflow-auto w-[95%] flex justify-center'>
						<table>
							<tbody>
								<tr>
									<th>Amount</th>
									<th>Time Deposited</th>
								</tr>
								{recentTxs.map((tx, i) => (
									<tr key={i} className='odd:bg-slate-300'>
										<td className='px-4 text-center border border-black border-spacing-2'>
											{readableEthAmt(tx.args[1])} ETH
										</td>
										<td className='px-4 py-1 text-center border border-black border-spacing-2'>
											{readableTime(tx.args[2])}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<h3 className='text-slate-700'>No deposits have been made yet</h3>
				)}

				{/* ---------- button layout for page 1 --------- */}
				{page === 1 && (
					<div className='grid grid-cols-2 gap-2 pt-4'>
						<Link
							href={'/user/deposit'}
							className='btn underline hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'
						>
							Back
						</Link>

						<button
							className={`btn ${
								recentTxs.length < pageSize * page
									? 'bg-slate-600 text-white hover:bg-black hover:scale-100'
									: 'hover:bg-gradient-to-br from-green-700 via-cyan-600 to-blue-700'
							}`}
							onClick={() => setPage(page + 1)}
							disabled={recentTxs.length < pageSize * page ? true : false}
						>
							Next Page
						</button>
					</div>
				)}

				{/* ---------- button layout for page 2+ --------- */}

				{page > 1 && (
					<>
						<div className='grid grid-cols-2 gap-2 pt-4'>
							<button
								className='btn hover:bg-gradient-to-bl from-blue-700 via-cyan-600 to-green-700'
								onClick={() => setPage(page - 1)}
							>
								Prev Page
							</button>
							<button
								className={`btn ${
									recentTxs.length < pageSize * page
										? 'bg-slate-600 text-white hover:bg-black hover:scale-100'
										: 'hover:bg-gradient-to-br from-green-700 via-cyan-600 to-blue-700'
								}`}
								onClick={() => setPage(page + 1)}
								disabled={recentTxs.length < pageSize * page ? true : false}
							>
								Next Page
							</button>
						</div>

						<Link
							href={'/user/deposit'}
							className='mt-2 btn underline hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'
						>
							Back
						</Link>
					</>
				)}
				<button
					className='mt-4 bg-red-400 btn hover:bg-red-600 hover:text-white'
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

export default DepHistory;
