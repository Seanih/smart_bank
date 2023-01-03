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

	const readableBigNum = num => ethers.utils.formatEther(num);

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

				setDepositTxs(
					depositEvents.sort((a, b) => b.blockNumber - a.blockNumber)
				);
			} catch (error) {
				console.log(error.message);
			}
		};

		handleCompareAddresses();
		getDepositEvents();
	}, [user.address, baseUrl, username, password, handleCompareAddresses]);

	console.log(depositTxs);
	return (
		<div className='page-container'>
			<main className='flex flex-col rounded-xl justify-center items-center py-8 w-[80%] md:w-[70%] bg-gray-200 text-black'>
				<div>
					{recentTxs.length > 0 ? (
						<table>
							<tbody>
								<tr>
									<th>Amount</th>
									<th>Time Deposited</th>
								</tr>
								{recentTxs.map((tx, i) => (
									<tr key={i}>
										<td className='border border-black border-spacing-2 pl-1 pr-4'>
											{readableBigNum(tx.args[1])} ETH
										</td>
										<td className='border border-black border-spacing-2 text-center px-4 py-1'>
											{readableTime(tx.args[2])}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : null}
				</div>
				{page === 1 && (
					<div className='pt-4 grid grid-cols-2 gap-2'>
						<button className='btn hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'>
							<Link href={'/user/deposit'}>Back</Link>
						</button>
						<button
							className='btn hover:bg-gradient-to-br from-green-700 via-cyan-600 to-green-700'
							onClick={() => setPage(page + 1)}
						>
							Next Page
						</button>
					</div>
				)}
				{page > 1 && (
					<>
						<div className='pt-4 grid grid-cols-2 gap-2'>
							<button
								className='btn hover:bg-gradient-to-bl from-blue-700 via-cyan-600 to-green-700'
								onClick={() => setPage(page - 1)}
							>
								Prev Page
							</button>
							<button
								className={`btn ${
									recentTxs.length < pageSize
										? 'bg-slate-600 text-white hover:bg-black hover:scale-100'
										: 'hover:bg-gradient-to-br from-green-700 via-cyan-600 to-blue-700'
								}`}
								onClick={() => setPage(page + 1)}
								disabled={recentTxs.length < pageSize ? true : false}
							>
								Next Page
							</button>
						</div>
						<button className='btn mt-2 hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'>
							<Link href={'/user/deposit'}>Back</Link>
						</button>
					</>
				)}
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
