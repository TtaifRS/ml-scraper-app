const electron = require("electron")

interface ElectronAPI {
  sendSearch: (searchTerm: string) => void,
  onSearchResult: (callback: (result: string) => void) => () => void,
  onSearchError: (callback: (error: string) => void) => () => void
  
  scrapeJobs: () => void,
  onScrapeJobResult: (callback: (result: string) => void) => () => void,
  onScrapeJobError: (callback: (error: string) => void) => () => void
  
  scrapeCompanies: () => void,
  onScrapeCompanyResult: (callback: (result: string) => void) => () => void,
  onScrapeCompanyError: (callback: (error: string) => void) => () => void

}

electron.contextBridge.exposeInMainWorld("electronAPI", {
  sendSearch: (searchTerm: string) => electron.ipcRenderer.send('search', searchTerm),
  onSearchResult: (callback: (result: string) => void) =>  {
    const listener = (_event: Electron.IpcRendererEvent, result: string) => callback(result)
    electron.ipcRenderer.on('search-result', listener)
    return () => electron.ipcRenderer.removeListener('search-result', listener)
  },
  onSearchError: (callback: (error: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
    electron.ipcRenderer.on('search-error', listener)
    return () => electron.ipcRenderer.removeListener('search-error', listener)
  }, 

  scrapeJobs:() => electron.ipcRenderer.send('scrape-jobs'),
  onScrapeJobResult: (callback: (result: string) => void) =>  {
    const listener = (_event: Electron.IpcRendererEvent, result: string) => callback(result)
    electron.ipcRenderer.on('scrape-jobs-result', listener)
    return () => electron.ipcRenderer.removeListener('scrape-jobs-result', listener)
  },
  onScrapeJobError: (callback: (error: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
    electron.ipcRenderer.on('scrape-jobs-error', listener)
    return () => electron.ipcRenderer.removeListener('scrape-jobs-error', listener)
  }, 
  
  scrapeCompanies: () => electron.ipcRenderer.send('scrape-companies'),
  onScrapeCompanyResult: (callback: (result: string) => void) =>  {
    const listener = (_event: Electron.IpcRendererEvent, result: string) => callback(result)
    electron.ipcRenderer.on('scrape-companies-result', listener)
    return () => electron.ipcRenderer.removeListener('scrape-companies-result', listener)
  },
  onScrapeCompanyError: (callback: (error: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
    electron.ipcRenderer.on('scrape-companies-error', listener)
    return () => electron.ipcRenderer.removeListener('scrape-companies-error', listener)
  }, 
  
 
} as ElectronAPI)