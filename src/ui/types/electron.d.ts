type Unsubscribe = () => void

declare global {
	interface Window {
		electronAPI: {
			sendSearch: (searchTerm: string) => void
      onSearchProgress: (callback: (msg: string) => void) => Unsubscribe
      onSearchResult: (callback: (result: string) => void) => Unsubscribe
			onSearchError: (callback: (error: string) => void) => Unsubscribe
  

			scrapeJobs: () => void
      onScrapeJobProgress: (callback: (msg: string) => void) => Unsubscribe
      onScrapeJobResult: (callback: (result: string) => void) => Unsubscribe
			onScrapeJobError: (callback: (error: string) => void) => Unsubscribe


			scrapeCompanies: () => void
      onSracpreCompanyProgress: (callback: (msg: string) => void) => Unsubscribe
      onScrapeCompanyResult: (callback: (result: string) => void) => Unsubscribe
			onScrapeCompanyError: (callback: (error: string) => void) => Unsubscribe

      
      downloadCsv: () => void,
      onDownloadSuccess: (callback: (result: string) => void) => Unsubscribe
      onDownloadError: (callback: (error: string) => void) => Unsubscribe

      sendMultipleSearch: (searchTerms: string[]) => void
      onMultipleSearchProgress:(callback: (msg: string) => void) => Unsubscribe
      onMultipleSearchResult: (callback: (result: string) => void) => Unsubscribe
      onMultipleSearchError: (callback: (error: string) => void) => Unsubscribe
		}
	}
}

export {}