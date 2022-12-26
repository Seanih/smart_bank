import Link from 'next/link';

function Transfer() {
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
export default Transfer;
