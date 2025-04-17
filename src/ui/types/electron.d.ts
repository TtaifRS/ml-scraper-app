import { CompanyQueryParams, PaginatedCompaniesResult } from './company'
interface ScrapePayload {
  industryName: string,
  cityName?: string,
  category: string,
  subCategory: string
}

type Unsubscribe = () => void

declare global {
	interface Window {
		electronAPI: {
			sendSearch: (searchTerm: string) => void
      sendCancel: () => void
      onSearchProgress: (callback: (msg: string) => void) => Unsubscribe
      onSearchResult: (callback: (result: string) => void) => Unsubscribe
			onSearchError: (callback: (error: string) => void) => Unsubscribe
  

			scrapeJobs: () => void
      onScrapeJobProgress: (callback: (msg: string) => void) => Unsubscribe
      onScrapeJobResult: (callback: (result: string) => void) => Unsubscribe
			onScrapeJobError: (callback: (error: string) => void) => Unsubscribe


			scrapeCompanies: () => void
      onScrapeCompanyProgress: (callback: (msg: string) => void) => Unsubscribe
      onScrapeCompanyResult: (callback: (result: string) => void) => Unsubscribe
			onScrapeCompanyError: (callback: (error: string) => void) => Unsubscribe

      
      downloadCsv: () => void,
      onDownloadSuccess: (callback: (result: string) => void) => Unsubscribe
      onDownloadError: (callback: (error: string) => void) => Unsubscribe

      connectXingToCRM: () => void
      onConnectionProgress: (callback: (msg: string) => void) => Unsubscribe
      onConnectionSucces: (callback: (result: string) => void) => Unsubscribe
      onConnectionError: (callback: (error: string) => void) => Unsubscribe

      sendMultipleSearch: (searchTerms: string[]) => void
      onMultipleSearchProgress:(callback: (msg: string) => void) => Unsubscribe
      onMultipleSearchResult: (callback: (result: string) => void) => Unsubscribe
      onMultipleSearchError: (callback: (error: string) => void) => Unsubscribe

      onUpdateDownloadStart: (callback: () => void) => Unsubscribe
      onUpdateDownloadProgress: (callback: (progressObj: {percent: number}) => void) => Unsubscribe
      onUpdateDownloadComplete: (callback: () => void) => Unsubscribe

      getCompanies: (queryParams: CompanyQueryParams) => promise<PaginatedCompaniesResult>
      getCities: () => Promise<string[]>
      getServices: () => Promise<string[]>

      scrapeYellowPage: (payload: ScrapePayload[]) => void
      onScrapeYelloPageProgress: (callback: (msg: string) => void) => Unsubscribe
      onScrapeYellowPageSuccess: (callback: (result: string) => void) => Unsubscribe
      onScrapeYellowPageError: (callback: (error: string) => void) => Unsubscribe

      downloadYellowpageCsv: () => void,
      onDownloadYellowpageSuccess: (callback: (result: string) => void) => Unsubscribe,
      onDownloadYellowpageError: (callback: (error: string) => void) => Unsubscribe
		}
	}
}

export {}