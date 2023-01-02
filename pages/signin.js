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
			console.log(error.message);
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
			console.log(error.message);
		}
	};

	return (
		<div className='page-container'>
			<Head>
				<title>Smart Bank | Sign In</title>
				<meta name='description' content='Generated by create next app' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<main className='flex flex-col rounded-xl justify-center items-center py-8 md:h-1/2 w-[90%] sm:w-[80%] md:w-[70%] bg-gray-200 text-black'>
				<h1 className='mb-4 text-center'>
					Welcome to{' '}
					<span className='font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-cyan-600 to-gray-700'>
						Smart Bank
					</span>
				</h1>
				<h3 className='text-center'>
					Choose the wallet you would like to connect with:
				</h3>

				<div className='grid grid-cols-2 gap-2 px-2'>
					<button
						className='btn p-2 mt-5 hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'
						onClick={handleMetaAuth}
					>
						<div className='flex justify-between items-center'>
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
						className='btn p-2 mt-5 hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'
						onClick={handleCoinbaseAuth}
					>
						<div className='flex justify-between items-center'>
							<span className='text-sm sm:text-base'>Coinbase</span>
							<Image
								src={coinbase}
								alt='coinbase logo'
								width={60}
								height={60}
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
				<p className='relative top-8 sm:top-[10%] text-xs sm:text-sm px-4 text-center text-blue-700'>
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
