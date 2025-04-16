import { useEffect, useState } from 'react'
import IndustrySelector from './IndustrySelector'
import ConsoleArea, { ConsoleMessage } from '../ConsoleArea'

const ScrapeYellowPage = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [consoleMessage, setConsoleMessage] = useState<ConsoleMessage[]>([])
	useEffect(() => {
		const {
			onScrapeYelloPageProgress,
			onScrapeYellowPageSuccess,
			onScrapeYellowPageError,
		} = window.electronAPI
		const handleProgress = (message: string) => {
			setConsoleMessage((prev) => [...prev, { type: 'progress', message }])
			setIsLoading(true)
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

		const unsubscribeProggress = onScrapeYelloPageProgress(handleProgress)
		const unsubscribeSuccess = onScrapeYellowPageSuccess(handleResult)
		const unsubscribeError = onScrapeYellowPageError(handleError)

		return () => {
			unsubscribeProggress()
			unsubscribeSuccess()
			unsubscribeError()
		}
	}, [])
	const startScraping = () => {
		setIsLoading(true)
		setConsoleMessage([])
	}

	return (
		<div className="w-full">
			<IndustrySelector isDisabled={isLoading} startScraping={startScraping} />
			<ConsoleArea
				consoleMessages={consoleMessage}
				title="ML-Xing-App (Job Scrape Console)"
				onClear={() => setConsoleMessage([])}
			/>
		</div>
	)
}

export default ScrapeYellowPage
