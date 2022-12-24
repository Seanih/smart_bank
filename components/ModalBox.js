function ModalBox({
	currentAccount,
	ethBalance,
	usdValue,
	depositAmt,
	toggleModal,
}) {
	return (
		<>
			<div
				className={
					'absolute h-screen w-full bg-black/30 flex justify-center items-center ease-in duration-500'
				}
			>
				<div
					className={
						'bg-gray-100 text-black h-[50%] w-[50%] flex flex-col justify-center items-center rounded-md'
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
							onClick={() => toggleModal()}
						>
							Cancel
						</button>
						<button
							className='btn hover:scale-105 py-1 mt-2'
							onClick={() => toggleModal()}
						>
							Confirm Deposit
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
export default ModalBox;
