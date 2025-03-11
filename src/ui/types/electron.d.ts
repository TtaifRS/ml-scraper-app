declare global {
	interface Window {
		electronAPI: {
			sendSearch: (searchTerm: string) => void
      onSearchResult: (callback: (result: string) => void) => () => void
			onSearchError: (callback: (error: string) => void) => () => void

			scrapeJobs: () => void
      onScrapeJobResult: (callback: (result: string) => void) => () => void
			onScrapeJobError: (callback: (error: string) => void) => () => void


			scrapeCompanies: () => void
      onScrapeCompanyResult: (callback: (result: string) => void) => () => void
			onScrapeCompanyError: (callback: (error: string) => void) => () => void
		
		}
	}
}

export {}