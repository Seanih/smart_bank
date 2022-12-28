import { GridLoader } from 'react-spinners';

function LoadingModal({
	showDepositModal,
	showLoadingModal,
	toggleLoadingModal,
	txError,
}) {
	return (
		<>
			{!txError && (
				<div
					className={
						showLoadingModal
							? 'absolute h-screen w-full bg-black/30 flex justify-center items-center ease-in duration-500'
							: 'absolute -z-10 duration-300 ease-in'
					}
				>
					<div
						className={
							showLoadingModal
								? 'relative bg-gray-100 text-black h-[50%] w-[50%] flex flex-col justify-center items-center rounded-md top-0 ease-in duration-300'
								: 'top-full duration-300 ease-in'
						}
					>
						<p className='text-center px-8 pb-8'>
							Please wait while your transaction is being processed
						</p>
						<GridLoader color='teal' size={25} />
						<button onClick={toggleLoadingModal}>close modal</button>
					</div>
				</div>
			)}
		</>
	);
}
export default LoadingModal;
