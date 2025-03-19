import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { isDev } from './utils.js'
const envPath = isDev() ? '.env' : path.join(process.resourcesPath, '.env')
dotenvExpand.expand(dotenv.config({
  path: envPath
})
)


import { getPreloadPath } from './pathResolver.js'
import { scrapeJobLinks } from './services/xing/scrapeJobLinks.js'
import connectDB from './config/database.js'
import scrapeJobAndUpdateDB from './services/xing/scrapeJobDesc.js'
import scrapeCompnayAndUpdateDB from './services/xing/scrapeCompanyDetails.js'
import exportJobsToCSV from './services/xing/createCsv.js'
import { ScrapeMultipleJobLinks } from './services/xing/ScrapeMultipleJobLinks.js'



const uri: string = process.env.MONGO_URI || ""

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null


async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: getPreloadPath()
    }
  }) 
  if(isDev()){
    mainWindow.loadURL('http://localhost:5123')
  }else{
    mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'))
  }

  if(!isDev()){
    mainWindow.webContents.closeDevTools()
  }

  mainWindow.once('ready-to-show', () => {
    if(splashWindow) {
      splashWindow.close()
      splashWindow = null
    }
    mainWindow?.show()
  })

  
  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })
}


function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    minimizable: true,
    transparent: true,
    resizable: false
  })

  if(isDev()) {
    splashWindow.loadFile('splash.html')
  }else{
    splashWindow.loadFile(path.join(app.getAppPath() + '/dist-react/splash.html'))
  }
}


app.whenReady().then(async () => {
  try{
    createSplashWindow()
    setTimeout(async () => {
      try{
        await connectDB(uri)
        createMainWindow()
      }catch(error){
        console.error('Error starting the app', error instanceof Error ? error.message : error)
        app.quit()
      }
    },3000)
  }catch(error){
    console.error('Error starting the app', error instanceof Error ? error.message : error)
    app.quit()
  }
})




ipcMain.on('search', async(event: Electron.IpcMainEvent, searchTerm: string) => {
  try{
    
    
    await scrapeJobLinks(event, searchTerm, )
  }catch(error){
    console.error(error)
  }
})


ipcMain.on('search-multiple', async(event: Electron.IpcMainEvent, searchTerms: string[]) => {
  try{
    await ScrapeMultipleJobLinks(event, searchTerms)
  }catch(error){
    console.error(error)
  }
})

ipcMain.on('scrape-jobs', async(event: Electron.IpcMainEvent) => {
  try{
    await scrapeJobAndUpdateDB(event)
  }catch(error){
    console.error(error)
  }
})

ipcMain.on('scrape-companies', async(event: Electron.IpcMainEvent) => {
  try{
    await scrapeCompnayAndUpdateDB(event)
  }catch(error){
    console.error(error)
  }
})

ipcMain.on('download-csv', async(event: Electron.IpcMainEvent) => {
  try{
    await exportJobsToCSV(event)
  }catch(error){
    console.error(error)
  }
})



app.on('window-all-closed', () => {
 if(process.platform !== 'darwin'){
  app.quit()
 }
})

app.on('before-quit', () => {
  ipcMain.removeAllListeners()
  mainWindow = null
  splashWindow = null
  process.exit(0)
})

