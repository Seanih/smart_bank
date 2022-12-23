import Head from 'next/head';
import Image from 'next/image';

import metamask from '../public/metamask.png';

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { signIn } from 'next-auth/react';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { useRouter } from 'next/router';
import { useAuthRequestChallengeEvm } from '@moralisweb3/next';

function SignIn() {
	const { connectAsync } = useConnect();
	const { disconnectAsync } = useDisconnect();
	const { isConnected } = useAccount();
	const { signMessageAsync } = useSignMessage();
	const { requestChallengeAsync } = useAuthRequestChallengeEvm();
	const { push } = useRouter();

	const handleAuth = async () => {
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
	};

	return (
		<div className='page-container'>
			<Head>
				<title>Smart Bank | Sign In</title>
				<meta name='description' content='Generated by create next app' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<main className='flex flex-col rounded-xl justify-center items-center py-8 w-[80%] md:w-[70%] bg-gray-300 text-black'>
				<h1 className='mb-4'>
					Welcome to{' '}
					<span className='font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-cyan-600 to-gray-700'>
						Smart Bank
					</span>
				</h1>
				<p>Choose the wallet you would like to connect with:</p>

				<button
					className='btn py-2 mt-5 hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'
					onClick={handleAuth}
				>
					<div className='grid grid-cols-2 items-center gap-1'>
						<span>Metamask</span>
						<Image src={metamask} alt='metamask logo' width={60} />
					</div>
				</button>
			</main>
		</div>
	);
}

export default SignIn;
