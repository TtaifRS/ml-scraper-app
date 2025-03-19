import type { Browser, Page } from "rebrowser-puppeteer-core";
import * as cheerio from 'cheerio'
import { blockUnnecessaryResources } from '../puppteerConnection.js'
import { parseRelativeDate } from '../../helpers/parseRelativeData.js';
import { Job } from '../../models/job.model.js';
import { getCurrentime } from '../../helpers/getCurrentTime.js';



const scrollPageToBottom = async (page: Page) => {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise((resolve) => setTimeout(resolve, 1500));
};



export const scrapeJobLinks = async(event: Electron.IpcMainEvent, searchTerm: string, browser: Browser, page: Page  ) => {
  
  try{

    await blockUnnecessaryResources(page)
    page.setDefaultNavigationTimeout(0);
    await page.goto(`https://www.xing.com/jobs/search?keywords=${searchTerm}&sort=date&employmentType=FULL_TIME.ef2fe9&country=de.02516e`, {waitUntil: 'networkidle0'})

    event.reply('search-progress', `[${getCurrentime()}] Starting to scrape jobs for ${searchTerm}`)

    const jobCountText = await page.$eval('h1[data-xds="Headline"]', el => el.textContent || '');
    const jobCount = parseInt(jobCountText.replace(/\D/g, ''), 10) || 0; 

    const SEARCH_LIMIT = Math.min(jobCount, 1000); 
    console.log(`SEARCH_LIMIT set to: ${SEARCH_LIMIT}`);
    
    event.reply('search-progress', `[${getCurrentime()}] Search Limit set to ${SEARCH_LIMIT} for ${searchTerm}`)
 
    let previousHeight = 0;
    let stagentCount = 0
   
    const jobData = new Map<string, Date>()

 
  while (jobData.size <= SEARCH_LIMIT) {
    
    const html = await page.content()
    const $ = cheerio.load(html)
    const newResults = $('ol > li a article').map((_i, article) => {
      const hrefText = $(article).closest('a').attr('href')
      const dateText = $(article).find('p[class*="job-teaser-list-item-styles__Date"]').text().trim()
      const date = parseRelativeDate(dateText)
      const href = `https://www.xing.com${hrefText}`
    
      return {href, date}
    }).get().filter(item => item.href)

   
    newResults.forEach(({href, date}) => {
      if(href) jobData.set(href, date)
    })

    event.reply('search-progress', `[${getCurrentime()}] Scraped ${jobData.size} jobs so far for ${searchTerm} out of ${SEARCH_LIMIT}`)
    await scrollPageToBottom(page);
  
    console.log(`Current number of jobs ${jobData.size}`)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newHeight = await page.evaluate(() => document.body.scrollHeight);

    if (newHeight === previousHeight) {
      stagentCount++
      if(jobData.size >= (SEARCH_LIMIT - 20) || stagentCount > 5){
        break;
      }else{
        continue
      }
    }else{
      stagentCount = 0
    }
    previousHeight = newHeight;
  }

  

  const results = Array.from(jobData, ([href, date]) => ({href, date}))

  const saveJobs = results.map(({href, date}) => 
    Job.findOneAndUpdate(
      {link: href},
      {
        $set: {
          link: href,
          category: searchTerm,
          postingDate: date,
          description: 'To be scraped'
        }
      },
      {upsert: true, new: true}
    )
  )

  await Promise.all(saveJobs)
  const searchReply = `[${getCurrentime()}] Total ${jobData.size} job links scraped from ${searchTerm}`
   event.reply('search-result', searchReply)
  
  }catch(error){
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
    console.error(`Error during scraping: ${errorMessage}`)
    event.reply('search-error', `[${getCurrentime()}] Searched Canceled`)
  }finally{
    await browser.close()
  }
}