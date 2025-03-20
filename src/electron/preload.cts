const electron = require("electron")

const {ipcRenderer} = electron

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
}

type Unsubscribe = () => void

const createIpcHandler = <T,>(channel: string) => (callback: (payload: T) => void) : Unsubscribe => {
  const listner = (_event: Electron.IpcRendererEvent, payload: T) => callback(payload)
  ipcRenderer.on(channel, listner)
  return () => ipcRenderer.removeListener(channel, listner)
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
  onDownloadError: createIpcHandler('download-csv-error')
}


electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI)

