


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

interface ScrapePayload {
  industryName: string,
  cityName?: string,
  category: string,
  subCategory: string
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

  connectXingToCRM: () => void
  onConnectionProgress: (callback: (msg: string) => void) => Unsubscribe
  onConnectionSucces: (callback: (result: string) => void) => Unsubscribe
  onConnectionError: (callback: (error: string) => void) => Unsubscribe

  getCompanies: (queryParams: CompanyQueryParams) => Promise<PaginatedCompaniesResult>
  getCities: () => Promise<string[]>
  getServices: () => Promise<string[]>

  onUpdateDownloadStart: (callback: () => void) => Unsubscribe
  onUpdateDownloadProgress: (callback: (progressObj: {percent: number}) => void) => Unsubscribe
  onUpdateDownloadComplete: (callback: () => void) => Unsubscribe

  scrapeYellowPage: (payload: ScrapePayload[]) => void
  onScrapeYelloPageProgress: (callback: (msg: string) => void) => Unsubscribe
  onScrapeYellowPageSuccess: (callback: (result: string) => void) => Unsubscribe
  onScrapeYellowPageError: (callback: (error: string) => void) => Unsubscribe

  downloadYellowpageCsv: () => void,
  onDownloadYellowpageSuccess: (callback: (result: string) => void) => Unsubscribe
  onDownloadYellowpageError: (callback: (error: string) => void) => Unsubscribe
  
}




const electronAPI : ElectronAPI = {
  //Xing Search API 
  sendSearch: (searchTerm) => ipcRenderer.send('search', searchTerm),
  sendCancel: () => ipcRenderer.send('search-cancel'),
  onSearchProgress: createIpcHandler('search-progress'),
  onSearchResult: createIpcHandler('search-result'),
  onSearchError: createIpcHandler('search-error'),


  //Xing Multple Search API
  sendMultipleSearch: (searchTerms) => ipcRenderer.send('search-multiple', searchTerms),
  onMultipleSearchProgress: createIpcHandler('search-multiple-progress'),
  onMultipleSearchResult: createIpcHandler('search-multiple-result'),
  onMultipleSearchError: createIpcHandler('search-multiple-error'),

  //Xing Job Scraping API 
  scrapeJobs: () => ipcRenderer.send('scrape-jobs'),
  onScrapeJobProgress: createIpcHandler('scrape-jobs-progress'),
  onScrapeJobResult: createIpcHandler('scrape-jobs-result'),
  onScrapeJobError: createIpcHandler('scrape-jobs-error'),

  //Xing Company Scraping API 
  scrapeCompanies: () => ipcRenderer.send('scrape-companies'),
  onScrapeCompanyProgress: createIpcHandler('scrape-companies-progress'),
  onScrapeCompanyResult: createIpcHandler('scrape-companies-result'),
  onScrapeCompanyError: createIpcHandler('scrape-companies-error'),

  //Xing Download CSV
  downloadCsv: () => ipcRenderer.send('download-csv'),
  onDownloadSuccess: createIpcHandler('download-csv-result'),
  onDownloadError: createIpcHandler('download-csv-error'),

  //Xing CRM Connections
  connectXingToCRM: () => ipcRenderer.send('connect-xing-crm'),
  onConnectionProgress: createIpcHandler('connect-xing-crm-progress'),
  onConnectionSucces: createIpcHandler('connect-xing-crm-successfull'),
  onConnectionError: createIpcHandler('connect-xing-crm-error'),

  //Xing Company Data API 
  getCompanies: (queryParams) => ipcRenderer.invoke('get-companies', queryParams),
  getCities: () => ipcRenderer.invoke('get-cities'),
  getServices: () => ipcRenderer.invoke('get-services'),


  //App Update Downlaod
  onUpdateDownloadStart: createIpcHandler('update-download-start'),
  onUpdateDownloadProgress: createIpcHandler('update-download-progress'),
  onUpdateDownloadComplete: createIpcHandler('update-download-complete'),

  scrapeYellowPage: (payload) => ipcRenderer.send('scrape-yellowpage', payload),
  onScrapeYelloPageProgress: createIpcHandler('scrape-yellowpage-progress'),
  onScrapeYellowPageSuccess: createIpcHandler('scrape-yellowpage-success'),
  onScrapeYellowPageError: createIpcHandler('scrape-yellowpage-error'),

  downloadYellowpageCsv: () => ipcRenderer.send('download-yellowpage-csv'),
  onDownloadYellowpageSuccess: createIpcHandler('download-yellowpage-csv-result'),
  onDownloadYellowpageError: createIpcHandler('download-yellowpage-csv-error')
}


electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI)

