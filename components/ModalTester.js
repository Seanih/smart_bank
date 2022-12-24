import { useState } from 'react';

function ModalTester({
	currentAccount,
	ethBalance,
	usdValue,
	depositAmt,
	showDepositModal,
	toggleShowModal,
}) {
	// const [showDepositModal, setShowDepositModal] = useState(false);
	// const toggleShowModal = () => setShowDepositModal(!showDepositModal);

	return (
		<div
			className={
				showDepositModal
					? 'absolute h-screen w-full bg-black/30 flex justify-center items-center ease-in-out duration-500'
					: 'absolute -z-10 duration-300 ease-in-out '
			}
		>
			<div
				className={
					showDepositModal
						? 'relative bg-gray-100 text-black h-[50%] w-[50%] flex flex-col justify-center items-center rounded-md top-0 ease-in-out duration-300'
						: 'top-full duration-300 ease-in-out '
				}
			>
				<h3 className='font-medium'>Please verify transaction details:</h3>
				<p>Deposit Amount: {depositAmt} ETH</p>
				<p>Wallet ETH Balance: {ethBalance}</p>
				<p>
					Wallet Balance After Deposit:{' '}
					<span className={ethBalance - depositAmt < 0 ? 'text-red-600' : ''}>
						{ethBalance - depositAmt}
					</span>
				</p>
				<div className='h-[2px] w-[80%] bg-slate-500 my-4' />
				<div className='grid grid-cols-2 gap-2'>
					<button
						className='btn hover:scale-105 py-1 mt-2 bg-red-400 hover:bg-red-600 hover:text-white'
						onClick={() => toggleShowModal()}
					>
						Cancel
					</button>
					<button
						className='btn hover:scale-105 py-1 mt-2'
						onClick={() => toggleShowModal()}
					>
						Confirm Deposit
					</button>
				</div>
			</div>
		</div>
	);
}
export default ModalTester;
