import { useEffect, useState } from 'react'

interface JobData {
	title?: string | null
	link?: string | null
	companyName?: string | null
	companyUrl?: string | null
	companyService?: string | null
	location?: string | null
	jobVerified: boolean
	jobType?: string | null
	salary?: string | null
	salaryProvidedByCompany: boolean
	description?: string | null
}

declare global {
	interface Window {
		electronAPI: {
			sendSearch: (searchTerm: string) => void
			scrapeJobs: () => void
			scrapeCompanies: () => void
			onSearchResults: (callback: (results: JobData[]) => void) => () => void
			onSearchError: (callback: (error: string) => void) => () => void
		}
	}
}

const SearchComponent = () => {
	const [searchTerm, setSearchTerm] = useState<string>('')

	const [results, setResults] = useState<JobData[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		const { onSearchResults, onSearchError } = window.electronAPI

		const unsubscribeResults = onSearchResults((results) => {
			console.log('recieving results')
			setResults(results)
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
		setResults([])

		window.electronAPI.sendSearch(searchTerm)

		setIsLoading(false)
	}

	const handleScrape = () => {
		setIsLoading(true)
		setError('')
		setResults([])

		window.electronAPI.scrapeJobs()
	}

	const handleScrapeCompanies = () => {
		window.electronAPI.scrapeCompanies()
	}

	return (
		<div className="flex flex-col gap-[16px] bg-stone-500 w-screen h-full items-start justify-center px-[120px]">
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
			<div className="flex w-full flex-row gap-[8px] items-center">
				<p className="w-full font-medium text-xl">
					Scrape all {searchTerm ? searchTerm.toLocaleUpperCase() : ''} Xing
					Jobs
				</p>
				<button
					className="text-white w-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
					onClick={handleScrape}
				>
					Scrape Jobs
				</button>
			</div>

			<div className="flex w-full flex-row gap-[8px] items-center">
				<p className="w-full font-medium text-xl">Scrape all Companies</p>
				<button
					className="text-white w-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
					onClick={handleScrapeCompanies}
				>
					Scrape Companies
				</button>
			</div>

			{error && <p>{error}</p>}
			{results && (
				<>
					{results.map((result, index) => (
						<ul key={index}>
							<li>{result.link}</li>
							<li>{result.title}</li>
							<li>{result.companyName}</li>
							<li>{result.location}</li>
							<li>{result.salary}</li>
						</ul>
					))}
				</>
			)}
		</div>
	)
}

export default SearchComponent
