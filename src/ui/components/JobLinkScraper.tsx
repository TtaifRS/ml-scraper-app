import { useEffect, useState } from 'react'
import JobTitleSelector from './JobTitleSelector'
import SearchJobs from './SearchJobs'
import ConsoleArea, { ConsoleMessage } from './ConsoleArea'

const JobLinkScraper = () => {
	const [isScraping, setIsScraping] = useState<boolean>(false)
	const [consoleMessage, setConsoleMessage] = useState<ConsoleMessage[]>([])
	useEffect(() => {
		const {
			onSearchResult,
			onSearchProgress,
			onSearchError,
			onMultipleSearchProgress,
			onMultipleSearchResult,
			onMultipleSearchError,
		} = window.electronAPI

		const handleProgress = (message: string) => {
			setConsoleMessage((prev) => [...prev, { type: 'progress', message }])
		}
		const handleResult = (result: string) => {
			setConsoleMessage((prev) => [
				...prev,
				{ type: 'result', message: result },
			])
			setIsScraping(false)
		}

		const handleError = (errorMessage: string) => {
			setConsoleMessage((prev) => [
				...prev,
				{ type: 'error', message: errorMessage },
			])
			setIsScraping(false)
		}

		const unsubscribeSearchProgress = onSearchProgress(handleProgress)
		const unsubscribeSearchResult = onSearchResult(handleResult)
		const unsubscribeSearchError = onSearchError(handleError)

		const unsubscribeMultipleSearchProgress =
			onMultipleSearchProgress(handleProgress)
		const unsubscribeMultipleSearchResult = onMultipleSearchResult(handleResult)
		const unsubscribeMultipleSearchError = onMultipleSearchError(handleError)

		return () => {
			unsubscribeSearchProgress()
			unsubscribeSearchResult()
			unsubscribeSearchError()
			unsubscribeMultipleSearchProgress()
			unsubscribeMultipleSearchResult()
			unsubscribeMultipleSearchError()
		}
	}, [])

	const startScraping = () => {
		setIsScraping(true)
		setConsoleMessage([])
	}
	return (
		<div className="p-4">
			<SearchJobs isDisabled={isScraping} startScraping={startScraping} />
			<JobTitleSelector isDisabled={isScraping} startScraping={startScraping} />
			<ConsoleArea
				consoleMessages={consoleMessage}
				title="ML-Xing-App (Job Scrape Console)"
				onClear={() => setConsoleMessage([])}
			/>
		</div>
	)
}

export default JobLinkScraper
