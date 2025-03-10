const electron = require("electron")

interface ElectronAPI {
  sendSearch: (searchTerm: string) => void,
  scrapeJobs: () => void,
  onSearchResults: (callback: (links: string[]) => void) => () => void,
  onSearchError: (callback: (error: string) => void) => () => void
}

electron.contextBridge.exposeInMainWorld("electronAPI", {
  sendSearch: (searchTerm: string) => electron.ipcRenderer.send('search', searchTerm),
  scrapeJobs:() => electron.ipcRenderer.send('scrape-jobs'),
  onSearchResults: (callback: (links: string[]) => void) =>  {
    const listener = (_event: Electron.IpcRendererEvent, links: string[]) => callback(links)
    electron.ipcRenderer.on('search-results', listener)
    return () => electron.ipcRenderer.removeListener('search-results', listener)
  },
  onSearchError: (callback: (error: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, error: string) => callback(error)
    electron.ipcRenderer.on('search-error', listener)
    return () => electron.ipcRenderer.removeListener('search-error', listener)
  } 
} as ElectronAPI)