import { ICompany } from './company'


type Unsubscribe = () => void

export interface CompanyQueryParams {
  page: number,
  limit: number,
  city?: string | undefined,
  search?: string,
  sortBy: keyof ICompany,
  sortOrder: 'asc' | 'desc'
}

export interface PaginatedCompaniesResult{
  companies: ICompany[],
  totalPages: number,
  currentPage: number
}

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

      sendMultipleSearch: (searchTerms: string[]) => void
      onMultipleSearchProgress:(callback: (msg: string) => void) => Unsubscribe
      onMultipleSearchResult: (callback: (result: string) => void) => Unsubscribe
      onMultipleSearchError: (callback: (error: string) => void) => Unsubscribe

      onUpdateDownloadStart: (callback: () => void) => Unsubscribe
      onUpdateDownloadProgress: (callback: (progressObj: {percent: number}) => void) => Unsubscribe
      onUpdateDownloadComplete: (callback: () => void) => Unsubscribe

      getCompanies: (queryParams: CompanyQueryParams) => promise<PaginatedCompaniesResult>
      getCities: () => Promise<string[]>
		}
	}
}

export {}