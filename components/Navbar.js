/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

function Navbar() {
	const [nav, setNav] = useState(false);

	const handleNav = () => setNav(!nav);

	return (
		<div
			className='absolute top-0 w-full bg-gray-500 h-20 shadow-xl cursor-pointer'
			onClick={handleNav}
		>
			{/* -------- side menu -------- */}

			<div
				className={
					nav
						? 'fixed left-0 top-0 w-[75%] sm:w-[60%] md:w-[45%] h-screen bg-gray-700 p-10 ease-in duration-300'
						: 'fixed left-[-100%] top-0 p-10 ease-in duration-300'
				}
			>
				<div>
					<div className='flex justify-between w-full items-center'>
						<div
							onClick={handleNav}
							className='rounded-full shadow-lg shadow-gray-400 p-3 cursor-pointer'
						>
							<AiOutlineClose />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
export default Navbar;
