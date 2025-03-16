import { useEffect, useState } from 'react'

const SearchJobs = () => {
	const [searchTerm, setSearchTerm] = useState<string>('')
	const [result, setResult] = useState<string>('')
	const [progressMessages, setProgressMessages] = useState<string[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		const { onSearchResult, onSearchProgress, onSearchError } =
			window.electronAPI

		const unsubscribeProgress = onSearchProgress((message) => {
			setProgressMessages((prev) => {
				return [...prev.slice(0, 2), ...prev.slice(2).concat(message).slice(-5)]
			})
		})

		const unsubscribeResult = onSearchResult((res) => {
			setResult(res)
			setIsLoading(false)
		})

		const unsubscribeError = onSearchError((errorMessage) => {
			setError(errorMessage)
			setIsLoading(false)
		})

		return () => {
			unsubscribeProgress()
			unsubscribeResult()
			unsubscribeError()
		}
	}, [])

	const handleSearch = () => {
		if (!searchTerm) return

		setIsLoading(true)
		setError('')
		setResult('')
		setProgressMessages([])

		window.electronAPI.sendSearch(searchTerm)
		console.log(result)
	}

	return (
		<>
			<div className="flex w-full flex-row justify-between gap-[8px] items-center overflow-hidden">
				<input
					type="text"
					value={searchTerm}
					placeholder="Search Jobs"
					className="bg-gray-50 w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					onChange={(e) => setSearchTerm(e.target.value)}
				/>

				<button
					className="text-white w-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
					onClick={handleSearch}
					disabled={isLoading}
				>
					{isLoading ? 'Searching' : 'Search'}
				</button>
			</div>
			<div className="bg-black w-full rounded-lg shadow-lg overflow-hidden p-4">
				<p className="text-emerald-700">ML-XING-APP Search Console</p>
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
								Scraping job links. Please wait...
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

export default SearchJobs
