import { useEffect, useState } from 'react'

const SearchJobs = () => {
	const [searchTerm, setSearchTerm] = useState<string>('')
	const [result, setResult] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		const { onSearchResult, onSearchError } = window.electronAPI

		const unsubscribeResults = onSearchResult((result) => {
			setResult(result)
			setIsLoading(false)
		})

		const unsubscribeError = onSearchError((errorMessage) => {
			setError(errorMessage)
			setIsLoading(false)
		})

		return () => {
			unsubscribeResults()
			unsubscribeError()
		}
	}, [])

	const handleSearch = () => {
		if (!searchTerm) return

		setIsLoading(true)
		setError('')
		setResult('')

		window.electronAPI.sendSearch(searchTerm)
	}

	return (
		<>
			<div className="flex w-full flex-row justify-between gap-[8px] items-center">
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
			<div>
				{isLoading ? (
					<p className="text-yellow-300">Scraping job links. Please wait...</p>
				) : result.length ? (
					<p className="text-green-300">{result}</p>
				) : null}
			</div>

			{error && <p className="text-red-300">{error}</p>}
		</>
	)
}

export default SearchJobs
