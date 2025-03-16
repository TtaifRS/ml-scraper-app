import { useEffect, useState } from 'react'

const ScrapeCompanies = () => {
	const [result, setResult] = useState<string>('')
	const [progressMessages, setProgressMessages] = useState<string[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		const {
			onScrapeCompanyResult,
			onSracpreCompanyProgress,
			onScrapeCompanyError,
		} = window.electronAPI

		const unsubscribeProgress = onSracpreCompanyProgress((message) => {
			setProgressMessages((prev) => {
				const updated = [...prev, message]
				const sliced = updated.slice(-10)

				return sliced
			})
		})

		const unsubscribeResults = onScrapeCompanyResult((result) => {
			setResult(result)
			setIsLoading(false)
		})

		const unsubscribeError = onScrapeCompanyError((errorMessage) => {
			setError(errorMessage)
			setIsLoading(false)
		})

		return () => {
			unsubscribeProgress()
			unsubscribeResults()
			unsubscribeError()
		}
	}, [])

	const handleScrapeCompanies = () => {
		setIsLoading(true)
		setError('')
		setResult('')
		setProgressMessages([])
		window.electronAPI.scrapeCompanies()
	}

	return (
		<>
			<div className="flex w-full flex-row gap-[8px] items-center">
				<p className="w-full font-medium text-xl">Scrape all Companies</p>
				<button
					className="text-white w-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
					onClick={handleScrapeCompanies}
				>
					Scrape Companies
				</button>
			</div>
			<div className="bg-black w-full rounded-lg shadow-lg overflow-hidden p-4">
				<p className="text-emerald-700">ML-XING-APP Company Scrape Console</p>
				{isLoading && (
					<div>
						{progressMessages.length > 0 ? (
							progressMessages.map((msg, index) => (
								<p key={index} className="text-indigo-400">
									{msg}
								</p>
							))
						) : (
							<p className="text-yellow-300">
								Scraping company details. Please wait...
							</p>
						)}
					</div>
				)}
				{!isLoading && result ? (
					<p className="text-green-300">{result}</p>
				) : null}

				{error && <p className="text-red-300">{error}</p>}
			</div>
		</>
	)
}

export default ScrapeCompanies
