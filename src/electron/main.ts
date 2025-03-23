import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import pkg from 'electron-updater'
import path from 'path'
import type { Browser } from "rebrowser-puppeteer-core";
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
import { createRealBrowser } from './services/puppteerConnection.js'



const uri: string = process.env.MONGO_URI || ""
let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null

const {autoUpdater} = pkg

autoUpdater.autoDownload = false
autoUpdater.allowPrerelease = false

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
    },
    minimizable: true,

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

    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.error('Auto update check failed', err)
    })
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
    },5000)
  }catch(error){
    console.error('Error starting the app', error instanceof Error ? error.message : error)
    app.quit()
  }
})



autoUpdater.on('update-available', (info) => {
  autoUpdater.logger?.info(`Update available: ${info}`)
  dialog.showMessageBox({
    type: 'info',
    title: 'Update availble',
    message: `A new version ${info.version} is available. Do want to download and install it now?`,
    buttons: ['Yes', 'Later']
  })
  .then((result) => {
    if(result.response === 0) {
      autoUpdater.downloadUpdate()
    }
  })
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'The new version has been downloaded. Restart the app to apply the update',
    buttons: ['Restart Now']
  })
  .then((result) => {
    if(result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
})

autoUpdater.on('error', () => {
  autoUpdater.logger?.error('Auto update error')
})

let currentBrowser : Browser | null = null

ipcMain.on('search', async(event: Electron.IpcMainEvent, searchTerm: string) => {
  try{
    const {browser, page} = await createRealBrowser()
    currentBrowser = browser
    await scrapeJobLinks(event, searchTerm, currentBrowser, page )
  }catch(error){
    console.error(error)
  }finally{
    if(currentBrowser){
      await currentBrowser.close()
      currentBrowser = null
    }
  }
})


ipcMain.on('search-cancel', () => {
  if(currentBrowser){
    currentBrowser.close()
    currentBrowser = null
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

