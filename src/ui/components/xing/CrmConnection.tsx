import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import ConsoleArea, { ConsoleMessage } from '../ConsoleArea'

const CrmConnection = () => {
	// const [result, setResult] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	// const [error, setError] = useState<string>('')
	const [consoleMessage, setConsoleMessage] = useState<ConsoleMessage[]>([])

	useEffect(() => {
		const {
			// onDownloadSuccess,
			// onDownloadError,
			onConnectionProgress,
			onConnectionSucces,
			onConnectionError,
		} = window.electronAPI

		const handleProgress = (message: string) => {
			setConsoleMessage((prev) => [...prev, { type: 'progress', message }])
		}
		const handleResult = (result: string) => {
			setConsoleMessage((prev) => [
				...prev,
				{ type: 'result', message: result },
			])
			setIsLoading(false)
		}

		const handleError = (errorMessage: string) => {
			setConsoleMessage((prev) => [
				...prev,
				{ type: 'error', message: errorMessage },
			])
			setIsLoading(false)
		}

		const unsubscribeConnectionProgress = onConnectionProgress(handleProgress)
		const unsubscribeConnectionResult = onConnectionSucces(handleResult)
		const unsubscribeConnectionError = onConnectionError(handleError)

		// const unsubscribeResults = onDownloadSuccess((result) => {
		// 	setResult(result)
		// 	setIsLoading(false)
		// })

		// const unsubscribeError = onDownloadError((errorMessage) => {
		// 	setError(errorMessage)
		// 	setIsLoading(false)
		// })

		return () => {
			// unsubscribeResults()
			// unsubscribeError()

			unsubscribeConnectionProgress()
			unsubscribeConnectionResult()
			unsubscribeConnectionError()
		}
	}, [])

	// const handleCsvDownload = () => {
	// 	setIsLoading(true)
	// 	setError('')
	// 	setResult('')

	// 	window.electronAPI.downloadCsv()
	// }

	const handleCRMConnection = () => {
		setIsLoading(true)
		setConsoleMessage([])
		window.electronAPI.connectXingToCRM()
	}
	return (
		<>
			{/* <div className="flex w-full flex-row gap-[8px] items-center p-4 overflow-x-hidden">
				<p className="w-full font-medium text-xl">Download CSV File</p>
				<Button
					onClick={handleCsvDownload}
					className="cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
				>
					Generate CSV
				</Button>
			</div> */}
			<div className="flex w-full flex-row gap-[8px] items-center p-4 overflow-x-hidden">
				<p className="w-full font-medium text-xl">Connect to CRM</p>
				<Button
					disabled={isLoading}
					onClick={handleCRMConnection}
					className="cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
				>
					Connect to CRM
				</Button>
			</div>
			<div className="px-2">
				<ConsoleArea
					consoleMessages={consoleMessage}
					title="ML-Xing-App (Xing to CRM Connection Console)"
					onClear={() => setConsoleMessage([])}
				/>
			</div>
		</>
	)
}

export default CrmConnection
