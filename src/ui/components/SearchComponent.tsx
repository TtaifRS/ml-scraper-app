import { useEffect, useState } from 'react'

declare global {
	interface Window {
		electronAPI: {
			sendSearch: (searchTerm: string) => void
			onSearchResults: (
				callback: (results: { href: string; date: Date }[]) => void
			) => () => void
			onSearchError: (callback: (error: string) => void) => () => void
		}
	}
}

const SearchComponent = () => {
	const [searchTerm, setSearchTerm] = useState<string>('')

	const [results, setResults] = useState<{ href: string; date: Date }[]>([])
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
					{results.map((result, index) => (
						<ul key={index}>
							<li>{result.href}</li>
							<li>{new Date(result.date).toLocaleDateString()}</li>
						</ul>
					))}
				</>
			)}
		</div>
	)
}

export default SearchComponent
