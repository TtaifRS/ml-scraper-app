import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import dotenv from 'dotenv'
import { isDev } from './utils.js'
import { getPreloadPath } from './pathResolver.js'
import { scrapeJobLinks } from './services/xing/scrapeJobLinks.js'
import connectDB from './config/database.js'
import scrapeJobAndUpdateDB from './services/xing/scrapeJobDesc.js'
import scrapeCompnayAndUpdateDB from './services/xing/scrapeCompanyDetails.js'

dotenv.config()

const uri: string = process.env.MONGO_URI || ''

let mainWindow  
app.on("ready", async () => {
 try{
  await connectDB(uri)
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
  ipcMain.on('search', async(_event: Electron.IpcMainEvent, searchTerm: string) => {
    await scrapeJobLinks(searchTerm)
  })

  ipcMain.on('scrape-jobs', async(event: Electron.IpcMainEvent) => {
    await scrapeJobAndUpdateDB(event)
  })
  
  ipcMain.on('scrape-companies', async() => {
    await scrapeCompnayAndUpdateDB()
  })
 }catch(error){
  const errorMessage = error instanceof Error ? error.message : error
  console.log(errorMessage)
 }
})

