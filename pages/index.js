import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
	return (
		<div className='page-container'>
			<Head>
				<title>Smart Bank | Home</title>
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
				<p>Please log in with a Web3 account to begin using our services</p>
				<Link href={'/signin'}>
					<button className='btn py-2 mt-5 hover:bg-gradient-to-br from-gray-700 via-cyan-600 to-gray-700'>
						Log In{' '}
					</button>
				</Link>
			</main>
		</div>
	);
}
