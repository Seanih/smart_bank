function WithdrawalModal({
	currentAccount,
	ethBalance,
	withdrawalAmt,
	showWithdrawalModal,
	toggleWithdrawalModal,
	withdrawEth,
}) {
	return (
		<div
			className={
				showWithdrawalModal
					? 'absolute h-screen w-full bg-black/30 flex justify-center items-center ease-in duration-500'
					: 'absolute -z-10 duration-300 ease-in'
			}
		>
			<div
				className={
					showWithdrawalModal
						? 'relative py-2 bg-gray-100 text-black w-[75%] sm:w-[50%] text-center flex flex-col justify-center items-center rounded-md top-0 ease-in duration-300'
						: 'top-full duration-300 ease-in'
				}
			>
				<div className='px-1'>
					<h3 className='font-medium mb-4 text-center'>
						Please verify transaction details:
					</h3>
					<p>
						Withdraw To:{' '}
						<span className='font-bold text-slate-600'>
							{`${currentAccount.slice(0, 4)}...${currentAccount.slice(
								currentAccount.length - 4
							)}`}
						</span>
					</p>
					<p>
						Withdrawal Amount:{' '}
						<span
							className={`font-bold ${
								withdrawalAmt > 0 ? 'text-green-700' : null
							}`}
						>
							{withdrawalAmt} ETH
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
						Wallet Balance After Withdrawal:{' '}
						<span
							className={`font-bold ${
								ethBalance - withdrawalAmt < 0
									? 'text-red-600'
									: 'text-green-700'
							}`}
						>
							{(Number(ethBalance) + Number(withdrawalAmt)).toFixed(4)}
						</span>
					</p>
				</div>
				<div className='h-[2px] w-[80%] bg-slate-500 my-4' />
				<div className='grid grid-cols-2 gap-2 px-2'>
					<button
						className='btn hover:scale-105 py-1 mt-2 bg-red-400 hover:bg-red-600 hover:text-white'
						onClick={toggleWithdrawalModal}
					>
						Cancel
					</button>
					<button
						className='btn hover:scale-105 py-1 mt-2 text-center'
						onClick={withdrawEth}
					>
						Confirm Withdrawal
					</button>
				</div>
			</div>
		</div>
	);
}
export default WithdrawalModal;
