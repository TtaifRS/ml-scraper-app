import { useEffect, useState } from 'react'

const ScrapeJobs = () => {
	const [result, setResult] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		const { onScrapeJobResult, onScrapeJobError } = window.electronAPI

		const unsubscribeResults = onScrapeJobResult((result) => {
			setResult(result)
			setIsLoading(false)
		})

		const unsubscribeError = onScrapeJobError((errorMessage) => {
			setError(errorMessage)
			setIsLoading(false)
		})

		return () => {
			unsubscribeResults()
			unsubscribeError()
		}
	}, [])

	const handleJobScrape = () => {
		setIsLoading(true)
		setError('')
		setResult('')
		window.electronAPI.scrapeJobs()
	}

	return (
		<>
			<div className="flex w-full flex-row gap-[8px] items-center">
				<p className="w-full font-medium text-xl">Scrape Xing Jobs</p>
				<button
					className="text-white w-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
					onClick={handleJobScrape}
				>
					Scrape Jobs
				</button>
			</div>
			<div>
				{isLoading ? (
					<p className="text-yellow-300">
						Scraping job details. Please wait...
					</p>
				) : result.length ? (
					<p className="text-green-300">{result}</p>
				) : null}
			</div>

			{error && <p className="text-red-300">{error}</p>}
		</>
	)
}

export default ScrapeJobs
