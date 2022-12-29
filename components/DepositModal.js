function DepositModal({
	currentAccount,
	ethBalance,
	depositAmt,
	showDepositModal,
	toggleDepositModal,
	depositEth,
}) {
	return (
		<div
			className={
				showDepositModal
					? 'absolute h-screen w-full bg-black/30 flex justify-center items-center ease-in duration-500'
					: 'absolute -z-10 duration-300 ease-in'
			}
		>
			<div
				className={
					showDepositModal
						? 'relative bg-gray-100 text-black h-[50%] w-[75%] sm:w-[50%] flex flex-col justify-center items-center rounded-md top-0 ease-in duration-300'
						: 'top-full duration-300 ease-in'
				}
			>
				<div className="px-1">
					<h3 className='font-medium mb-4 text-center'>
						Please verify transaction details:
					</h3>
					<p>
						Deposit From:{' '}
						<span className='font-bold text-slate-600'>
							{`${currentAccount.slice(0, 4)}...${currentAccount.slice(
								currentAccount.length - 4
							)}`}
						</span>
					</p>
					<p>
						Deposit Amount:{' '}
						<span
							className={`font-bold ${
								depositAmt > 0 ? 'text-green-700' : null
							}`}
						>
							{depositAmt} ETH
						</span>
					</p>
					<p>
						Wallet ETH Balance:{' '}
						<span
							className={`font-bold ${
								ethBalance > 0 ? 'text-green-700' : null
							}`}
						>
							{ethBalance}
						</span>
					</p>
					<p>
						Wallet Balance After Deposit:{' '}
						<span
							className={`font-bold ${
								ethBalance - depositAmt < 0 ? 'text-red-600' : 'text-green-700'
							}`}
						>
							{(ethBalance - depositAmt).toFixed(4)}
						</span>
					</p>
				</div>
				<div className='h-[2px] w-[80%] bg-slate-500 my-4' />
				<div className='grid grid-cols-2 gap-2 px-2'>
					<button
						className='btn hover:scale-105 py-1 mt-2 bg-red-400 hover:bg-red-600 hover:text-white'
						onClick={toggleDepositModal}
					>
						Cancel
					</button>
					<button
						className='btn hover:scale-105 py-1 mt-2'
						onClick={depositEth}
					>
						Confirm Deposit
					</button>
				</div>
			</div>
		</div>
	);
}
export default DepositModal;
