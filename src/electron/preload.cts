


const electron = require("electron")

const {ipcRenderer} = electron


type Unsubscribe = () => void

const createIpcHandler = <T,>(channel: string) => (callback: (payload: T) => void) : Unsubscribe => {
  const listner = (_event: Electron.IpcRendererEvent, payload: T) => callback(payload)
  ipcRenderer.on(channel, listner)
  return () => ipcRenderer.removeListener(channel, listner)
}

interface ICompany {
  _id: string,
  profileUrl: string,
  name: string,
  slogan: string | null,
  service: string | null,
  xingFollowers: string | null,
  employees: string | null,
  ratings: string | null,
  employeeRecommendation: string | null,
  contactInfoName: string | null,
  contactInfoPosition: string | null,
  city: string | null,
  fullAddress: string | null,
  phoneNumber: string | null,
  email: string | null,
  website: string | null,
  jobs: string[],
  createdAt: string,
  updatedAt: string
}

interface CompanyQueryParams {
  page: number,
  limit: number,
  city?: string,
  search?: string,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
}

interface PaginatedCompaniesResult{
  companies: ICompany[],
  totalPages: number,
  currentPage: number
}

interface ElectronAPI {
  sendSearch: (searchTerm: string) => void,
  sendCancel: () => void,
  onSearchProgress: (callback: (msg: string) => void) => Unsubscribe,
  onSearchResult: (callback: (result: string) => void) => Unsubscribe,
  onSearchError: (callback: (error: string) => void) => Unsubscribe


  scrapeJobs: () => void,
  onScrapeJobProgress: (callback: (msg: string) => void) => Unsubscribe,
  onScrapeJobResult: (callback: (result: string) => void) => Unsubscribe,
  onScrapeJobError: (callback: (error: string) => void) => Unsubscribe
  
  scrapeCompanies: () => void,
  onScrapeCompanyProgress: (callback: (msg: string) => void) => Unsubscribe,
  onScrapeCompanyResult: (callback: (result: string) => void) => Unsubscribe,
  onScrapeCompanyError: (callback: (error: string) => void) => Unsubscribe

  sendMultipleSearch: (searchTerms: string[]) => void
  onMultipleSearchProgress: (callback: (msg: string) => void) => Unsubscribe 
  onMultipleSearchResult: (callback: (result: string) => void) => Unsubscribe 
  onMultipleSearchError: (callback: (error: string) => void) => Unsubscribe

  downloadCsv: () => void,
  onDownloadSuccess: (callback: (result: string) => void) => Unsubscribe
  onDownloadError: (callback: (result: string) => void) => Unsubscribe

  onUpdateDownloadStart: (callback: () => void) => Unsubscribe
  onUpdateDownloadProgress: (callback: (progressObj: {percent: number}) => void) => Unsubscribe
  onUpdateDownloadComplete: (callback: () => void) => Unsubscribe

  getCompanies: (queryParams: CompanyQueryParams) => Promise<PaginatedCompaniesResult>
  getCities: () => Promise<string[]>
  getServices: () => Promise<string[]>
}




const electronAPI : ElectronAPI = {
  //Search API 
  sendSearch: (searchTerm) => ipcRenderer.send('search', searchTerm),
  sendCancel: () => ipcRenderer.send('search-cancel'),
  onSearchProgress: createIpcHandler('search-progress'),
  onSearchResult: createIpcHandler('search-result'),
  onSearchError: createIpcHandler('search-error'),


  //Multple Search API
  sendMultipleSearch: (searchTerms) => ipcRenderer.send('search-multiple', searchTerms),
  onMultipleSearchProgress: createIpcHandler('search-multiple-progress'),
  onMultipleSearchResult: createIpcHandler('search-multiple-result'),
  onMultipleSearchError: createIpcHandler('search-multiple-error'),

  //Job Scraping API 
  scrapeJobs: () => ipcRenderer.send('scrape-jobs'),
  onScrapeJobProgress: createIpcHandler('scrape-jobs-progress'),
  onScrapeJobResult: createIpcHandler('scrape-jobs-result'),
  onScrapeJobError: createIpcHandler('scrape-jobs-error'),

  //Company Scraping API 
  scrapeCompanies: () => ipcRenderer.send('scrape-companies'),
  onScrapeCompanyProgress: createIpcHandler('scrape-companies-progress'),
  onScrapeCompanyResult: createIpcHandler('scrape-companies-result'),
  onScrapeCompanyError: createIpcHandler('scrape-companies-error'),

  //Download CSV
  downloadCsv: () => ipcRenderer.send('download-csv'),
  onDownloadSuccess: createIpcHandler('download-csv-result'),
  onDownloadError: createIpcHandler('download-csv-error'),

  //Update Downlaod
  onUpdateDownloadStart: createIpcHandler('update-download-start'),
  onUpdateDownloadProgress: createIpcHandler('update-download-progress'),
  onUpdateDownloadComplete: createIpcHandler('update-download-complete'),

  //Company Data API 
  getCompanies: (queryParams) => ipcRenderer.invoke('get-companies', queryParams),
  getCities: () => ipcRenderer.invoke('get-cities'),
  getServices: () => ipcRenderer.invoke('get-services')
}


electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI)

