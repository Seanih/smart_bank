import { GridLoader } from 'react-spinners';

function LoadingModal({ showLoadingModal, txError }) {
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
								? 'relative bg-gray-100 text-black w-[50%] flex flex-col justify-center items-center rounded-md top-0 ease-in duration-300'
								: 'top-full duration-300 ease-in'
						}
					>
						<p className='px-8 pb-8 text-center'>
							Please wait while your transaction is being processed; this could
							take up to 1 minute.
						</p>
						<GridLoader color='teal' size={25} />
					</div>
				</div>
			)}
		</>
	);
}
export default LoadingModal;
