const electron = require("electron")

const {ipcRenderer} = electron

interface ElectronAPI {
  sendSearch: (searchTerm: string) => void,
 
  onSearchProgress: (callback: (msg: string) => void) => Unsubscribe,
  onSearchResult: (callback: (result: string) => void) => Unsubscribe,
  onSearchError: (callback: (error: string) => void) => Unsubscribe


  scrapeJobs: () => void,
  onScrapeJobProgress: (callback: (msg: string) => void) => Unsubscribe,
  onScrapeJobResult: (callback: (result: string) => void) => Unsubscribe,
  onScrapeJobError: (callback: (error: string) => void) => Unsubscribe
  
  scrapeCompanies: () => void,
  onSracpreCompanyProgress: (callback: (msg: string) => void) => Unsubscribe,
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
  onSracpreCompanyProgress: createIpcHandler('scrape-companies-progress'),
  onScrapeCompanyResult: createIpcHandler('scrape-companies-result'),
  onScrapeCompanyError: createIpcHandler('scrape-companies-error'),

  //Download CSV
  downloadCsv: () => ipcRenderer.send('download-csv'),
  onDownloadSuccess: createIpcHandler('download-csv-result'),
  onDownloadError: createIpcHandler('download-csv-error')
}


electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI)


// electron.contextBridge.exposeInMainWorld("electronAPI", {
//   sendSearch: (searchTerm: string) => electron.ipcRenderer.send('search', searchTerm),
//   onSearchProgress: (callback: (msg : string) => void) => {
//     const listener = (_event: Electron.IpcRendererEvent, msg: string) => callback(msg)
//     electron.ipcRenderer.on('search-progress', listener)
//     return() => electron.ipcRenderer.removeListener('search-progress', listener)
//   },
//   onSearchResult: (callback: (result: string) => void) =>  {
//     const listener = (_event: Electron.IpcRendererEvent, result: string) => callback(result)
//     electron.ipcRenderer.on('search-result', listener)
//     return () => electron.ipcRenderer.removeListener('search-result', listener)
//   },
//   onSearchError: (callback: (error: string) => void) => {
//     const listener = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
//     electron.ipcRenderer.on('search-error', listener)
//     return () => electron.ipcRenderer.removeListener('search-error', listener)
//   }, 

//   scrapeJobs:() => electron.ipcRenderer.send('scrape-jobs'),
//   onSracpreJobProgress: (callback: (msg : string) => void) => {
//     const listener = (_event: Electron.IpcRendererEvent, msg: string) => callback(msg)
//     electron.ipcRenderer.on('scrape-job-progress', listener)
//     return() => electron.ipcRenderer.removeListener('search-progress', listener)
//   },
//   onScrapeJobResult: (callback: (result: string) => void) =>  {
//     const listener = (_event: Electron.IpcRendererEvent, result: string) => callback(result)
//     electron.ipcRenderer.on('scrape-jobs-result', listener)
//     return () => electron.ipcRenderer.removeListener('scrape-jobs-result', listener)
//   },
//   onScrapeJobError: (callback: (error: string) => void) => {
//     const listener = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
//     electron.ipcRenderer.on('scrape-jobs-error', listener)
//     return () => electron.ipcRenderer.removeListener('scrape-jobs-error', listener)
//   }, 
  
//   scrapeCompanies: () => electron.ipcRenderer.send('scrape-companies'),
//   onSracpreCompanyProgress: (callback: (msg : string) => void) => {
//     const listener = (_event: Electron.IpcRendererEvent, msg: string) => callback(msg)
//     electron.ipcRenderer.on('scrape-companies-progress', listener)
//     return() => electron.ipcRenderer.removeListener('search-progress', listener)
//   },
//   onScrapeCompanyResult: (callback: (result: string) => void) =>  {
//     const listener = (_event: Electron.IpcRendererEvent, result: string) => callback(result)
//     electron.ipcRenderer.on('scrape-companies-result', listener)
//     return () => electron.ipcRenderer.removeListener('scrape-companies-result', listener)
//   },
//   onScrapeCompanyError: (callback: (error: string) => void) => {
//     const listener = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
//     electron.ipcRenderer.on('scrape-companies-error', listener)
//     return () => electron.ipcRenderer.removeListener('scrape-companies-error', listener)
//   },
  
//   sendMultipleSearch: (searchTerms: string[]) => electron.ipcRenderer.send('search-multiple', searchTerms),
//   onMultipleSearchProgress: (callback: (msg: string) => void) => {
//     const listener = (_event: Electron.IpcRendererEvent, msg: string) => callback(msg)
//     electron.ipcRenderer.on('search-multiple-progress', listener)
//     return () => electron.ipcRenderer.removeListener('search-multiple-progress', listener)
//   },
//   onMultipleSearchResult: (callback: (result: string) => void) => {
//     const listner = (_event: Electron.IpcRendererEvent, result: string) => callback(result)
//     electron.ipcRenderer.on('search-multiple-result', listner)
//     return () => electron.ipcRenderer.removeListener('search-multiple-result', listner)
//   },
//   onMultipleSearchError: (callback: (error: string) => void) => {
//     const listener = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
//     electron.ipcRenderer.on('search-multiple-error', listener)
//     return () => electron.ipcRenderer.removeListener('search-multiple-error', listener)
//   },
  

//   downloadCsv: () => electron.ipcRenderer.send('download-csv'),
//   onDownloadSuccess: (callback: (result: string) => void) => {
//     const listner = (_event: Electron.IpcRendererEvent, result: string) => callback(result)
//     electron.ipcRenderer.on('download-csv-result', listner)
//     return () => electron.ipcRenderer.removeListener('download-csv-result', listner)
//   },
//   onDownloadError: (callback: (result: string) => void) => {
//     const listner = (_event: Electron.IpcRenderer, result: string) => callback(result)
//     electron.ipcRenderer.on('download-csv-error', listner)
//     return () => electron.ipcRenderer.removeListener('download-csv-error', listner)
//   }

 
// } as ElectronAPI)