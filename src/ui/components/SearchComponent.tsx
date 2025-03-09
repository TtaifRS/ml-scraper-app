import { useEffect, useState } from 'react'

declare global {
	interface Window {
		electronAPI: {
			sendSearch: (searchTerm: string) => void
			onSearchResults: (callback: (links: string[]) => void) => () => void
			onSearchError: (callback: (error: string) => void) => () => void
		}
	}
}

const SearchComponent = () => {
	const [searchTerm, setSearchTerm] = useState<string>('')

	const [results, setResults] = useState<string[]>()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		const { onSearchResults, onSearchError } = window.electronAPI

		const unsubscribeResults = onSearchResults((links) => {
			console.log('recieving results')
			setResults(links)
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
		console.log(results)
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

			{error && <p>{error}</p>}
			{results && (
				<>
					{results.map((link, index) => (
						<ul key={index}>
							<li>{link}</li>
						</ul>
					))}
				</>
			)}
		</div>
	)
}

export default SearchComponent
