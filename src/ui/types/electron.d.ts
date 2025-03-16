declare global {
	interface Window {
		electronAPI: {
			sendSearch: (searchTerm: string) => void
      onSearchProgress: (callback: (msg: string) => void) => () => void
      onSearchResult: (callback: (result: string) => void) => () => void
			onSearchError: (callback: (error: string) => void) => () => void

			scrapeJobs: () => void
      onSracpreJobProgress: (callback: (msg: string) => void) => () => void
      onScrapeJobResult: (callback: (result: string) => void) => () => void
			onScrapeJobError: (callback: (error: string) => void) => () => void


			scrapeCompanies: () => void
      onSracpreCompanyProgress: (callback: (msg: string) => void) => () => void
      onScrapeCompanyResult: (callback: (result: string) => void) => () => void
			onScrapeCompanyError: (callback: (error: string) => void) => () => void

      
      downloadCsv: () => void,
      onDownloadSuccess: (callback: (result: string) => void) => () => void
      onDownloadError: (callback: (result: string) => void) => () => void
		}
	}
}

export {}