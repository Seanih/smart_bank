import Link from 'next/link';

function withdraw() {
	return (
		<div className='page-container'>
			<main className='flex flex-col rounded-xl justify-center items-center py-8 w-[80%] md:w-[70%] bg-gray-300 text-black'>
				<button className='btn'>
					<Link href={'/'}>back to main</Link>
				</button>
			</main>
		</div>
	);
}
export default withdraw;
