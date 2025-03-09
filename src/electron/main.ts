import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import dotenv from 'dotenv'
import { isDev } from './utils.js'
import { getPreloadPath } from './pathResolver.js'
import { scrapeJobLinks } from './services/xing/scrapeJobLinks.js'
import connectDB from './config/database.js'

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
  ipcMain.on('search', async(event: Electron.IpcMainEvent, searchTerm: string, searchLimit: number)=> {

    await scrapeJobLinks(event, searchTerm, searchLimit)
  })
 }catch(error){
  console.log( error)
 }
})

