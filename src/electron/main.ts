import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { isDev } from './utils.js'
import { getPreloadPath } from './pathResolver.js'
import { scrapeJobLinks } from './services/xing/scrapeJobLinks.js'
import connectDB from './config/database.js'
import scrapeJobAndUpdateDB from './services/xing/scrapeJobDesc.js'
import scrapeCompnayAndUpdateDB from './services/xing/scrapeCompanyDetails.js'
import exportJobsToCSV from './services/xing/createCsv.js'

const envPath = isDev() ? '.env' : path.join(process.resourcesPath, '.env')
dotenvExpand.expand(dotenv.config({
  path: envPath
})
)
const uri: string = process.env.MONGO_URI || ""

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
  ipcMain.on('search', async(event: Electron.IpcMainEvent, searchTerm: string) => {
    await scrapeJobLinks(event, searchTerm)
  })

  ipcMain.on('scrape-jobs', async(event: Electron.IpcMainEvent) => {
    await scrapeJobAndUpdateDB(event)
  })
  
  ipcMain.on('scrape-companies', async(event: Electron.IpcMainEvent) => {
    await scrapeCompnayAndUpdateDB(event)
  })

  ipcMain.on('download-csv', async(event: Electron.IpcMainEvent) => {
    await exportJobsToCSV(event)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })
 }catch(error){
  const errorMessage = error instanceof Error ? error.message : error
  console.log(errorMessage)
 }
})

app.on('window-all-closed', () => {
  mainWindow = null
  app.quit()
})

