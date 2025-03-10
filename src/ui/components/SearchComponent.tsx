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

	return (
		<div>
			<input
				type="text"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>

			<button onClick={handleSearch} disabled={isLoading}>
				{isLoading ? 'Searching' : 'Search'}
			</button>
			<button onClick={handleScrape}>scrape Job</button>

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
							<li>{result.description}</li>
						</ul>
					))}
				</>
			)}
		</div>
	)
}

export default SearchComponent
