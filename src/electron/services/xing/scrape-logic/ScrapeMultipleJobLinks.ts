import { createRealBrowser } from '../../puppteerConnection.js'

import { scrapeJobLinks } from './scrapeJobLinks.js'

import { getCurrentime } from '../../../helpers/getCurrentTime.js'
import { randomWait } from '../../../helpers/randomWait.js'



export const ScrapeMultipleJobLinks = async(event: Electron.IpcMainEvent, searchParams: string[], ) => {
  event.reply('search-multiple-progress', `[${getCurrentime()}] Search start for ${searchParams.join(", ")}`)
  try{
    event.reply('search-multiple-progress')
    for(const searchParam of searchParams){
      event.reply('search-multiple-progress', `[${getCurrentime()}] Starting search for ${searchParam}`)
      console.log(`Starting search for ${searchParam}`)
      const {browser, page} = await createRealBrowser()
      await scrapeJobLinks(event, searchParam, browser, page)
      await randomWait(500, 1000)
      event.reply('search-multiple-progress', `[${getCurrentime()}] Finished Search for ${searchParam}`)
      console.log(`Finished search for ${searchParam}`)
    }
    event.reply('search-multiple-result', `[${getCurrentime()}] Search complete for ${searchParams.join(", ")}`)
  }catch(error){
    const errorMessage = error instanceof Error ? error.message : "Something went wrong"
    console.log(errorMessage)
    console.log(error)
    event.reply('search-multiple-error', `[${getCurrentime()}] Error occured: ${errorMessage}`)
  }
}