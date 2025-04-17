import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import ConsoleArea, { ConsoleMessage } from '../ConsoleArea'

const GenerateYellowpagCSV = () => {
	// const [result, setResult] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	// const [error, setError] = useState<string>('')
	const [consoleMessage, setConsoleMessage] = useState<ConsoleMessage[]>([])

	useEffect(() => {
		const {
			// onDownloadSuccess,
			// onDownloadError,
			onDownloadYellowpageSuccess,
			onDownloadYellowpageError,
		} = window.electronAPI

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

		const unsubscribeConnectionResult =
			onDownloadYellowpageSuccess(handleResult)
		const unsubscribeConnectionError = onDownloadYellowpageError(handleError)

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

			unsubscribeConnectionResult()
			unsubscribeConnectionError()
		}
	}, [])

	const handleCsvDownload = () => {
		setIsLoading(true)
		setConsoleMessage([])

		window.electronAPI.downloadYellowpageCsv()
	}

	// const handleCRMConnection = () => {
	//   setIsLoading(true)
	//   setConsoleMessage([])
	//   window.electronAPI.connectXingToCRM()
	// }
	return (
		<>
			<div className="flex w-full flex-row gap-[8px] items-center p-4 overflow-x-hidden">
				<p className="w-full font-medium text-xl">
					Download Yellow page CSV File
				</p>
				<Button
					onClick={handleCsvDownload}
					disabled={isLoading}
					className="cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
				>
					Generate CSV
				</Button>
			</div>
			{/* <div className="flex w-full flex-row gap-[8px] items-center p-4 overflow-x-hidden">
        <p className="w-full font-medium text-xl">Connect to CRM</p>
        <Button
          disabled={isLoading}
          onClick={handleCRMConnection}
          className="cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
        >
          Connect to CRM
        </Button>
      </div> */}
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

export default GenerateYellowpagCSV
