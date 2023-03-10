import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

import metamask from '../public/metamask.png';
import coinbase from '../public/coinbase.png';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

import { signIn } from 'next-auth/react';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { useState } from 'react';
import { useAuthRequestChallengeEvm } from '@moralisweb3/next';

function SignIn() {
	const { connectAsync } = useConnect();
	const { disconnectAsync } = useDisconnect();
	const { isConnected } = useAccount();
	const { signMessageAsync } = useSignMessage();
	const { requestChallengeAsync } = useAuthRequestChallengeEvm();
	const { push } = useRouter();
	const [loginError, setLoginError] = useState(false);

	const handleMetaAuth = async () => {
		setLoginError(false);
		try {
			if (isConnected) {
				await disconnectAsync();
			}

			const { account, chain } = await connectAsync({
				connector: new MetaMaskConnector(),
			});

			const { message } = await requestChallengeAsync({
				address: account,
				chainId: chain.id,
			});

			const signature = await signMessageAsync({ message });

			// redirect user after success authentication to '/user' page
			const { url } = await signIn('moralis-auth', {
				message,
				signature,
				redirect: false,
				callbackUrl: '/user',
			});
			/**
			 * instead of using signIn(..., redirect: "/user")
			 * we get the url from callback and push it to the router to avoid page refreshing
			 */
			push(url);
		} catch (error) {
			setLoginError(true);
		}
	};

	const handleCoinbaseAuth = async () => {
		setLoginError(false);
		try {
			if (isConnected) {
				await disconnectAsync();
			}

			const { account, chain } = await connectAsync({
				connector: new CoinbaseWalletConnector({
					options: {
						appName: 'Smart Bank',
					},
				}),
			});

			const userData = { address: account, chain: chain.id, network: 'evm' };

			const { message } = await requestChallengeAsync(userData);

			const signature = await signMessageAsync({ message });

			// redirect user after success authentication to '/user' page
			const { url } = await signIn('moralis-auth', {
				message,
				signature,
				redirect: false,
				callbackUrl: '/user',
			});
			/**
			 * instead of using signIn(..., redirect: "/user")
			 * we get the url from callback and push it to the router to avoid page refreshing
			 */
			push(url);
		} catch (error) {
			setLoginError(true);
		}
	};

	return (
		<div className='page-container'>
			<Head>
				<title>Smart Bank | Sign In</title>
				<meta name='description' content='smart bank sign-in page' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='absolute flex flex-col rounded-xl justify-center items-center py-8 h-3/4 max-h-[500px] w-[90%] sm:w-[80%] md:w-[70%] bg-gray-200 text-black'>
				<p className='relative p-2 font-bold text-blue-800 border-2 border-blue-500 -top-6 rounded-xl'>
					Deployed on Goerli testnet
				</p>
				<h1 className='mb-4 text-center'>
					Welcome to{' '}
					<span className='font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-cyan-600 to-gray-700'>
						Smart Bank
					</span>
				</h1>
				<h3 className='text-center'>
					Choose the wallet you would like to sign in with:
				</h3>
				<div className='grid grid-cols-2 gap-2 px-2'>
					<button
						className='p-2 mt-5 btn hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'
						onClick={handleMetaAuth}
					>
						<div className='flex flex-col items-center justify-between xs:flex-row'>
							<span className='text-sm sm:text-base'>Metamask</span>
							<Image
								src={metamask}
								alt='metamask logo'
								width={60}
								height={60}
							/>
						</div>
					</button>
					<button
						className='p-2 mt-5 btn hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'
						onClick={handleCoinbaseAuth}
					>
						<div className='flex flex-col items-center justify-between xs:flex-row'>
							<span className='text-sm sm:text-base'>Coinbase</span>
							<Image
								src={coinbase}
								alt='coinbase logo'
								width={60}
								height={60}
								className='rounded-lg'
							/>
						</div>
					</button>
				</div>

				{loginError && (
					<div className='mt-2 w-[90%] border border-red-600'>
						<p className='px-4 text-center text-red-900'>
							The connection attempt was cancelled or an error occured
						</p>
					</div>
				)}
				<p className='relative px-4 text-xs text-center text-blue-800 top-8 sm:text-sm'>
					To ensure the best experience, only{' '}
					<span className='font-bold'>one(1)</span> wallet should be connected
					at a time.{' '}
					<span className='font-bold underline'>
						Please disconnect one before using another
					</span>
					.
				</p>
			</main>
		</div>
	);
}

export default SignIn;
