import type { Page } from "rebrowser-puppeteer-core";
import * as cheerio from 'cheerio'
import { blockUnnecessaryResources, createRealBrowser } from '../puppteerConnection.js'
import { parseRelativeDate } from '../../helpers/parseRelativeData.js';
import { Job } from '../../models/job.model.js';



const scrollPageToBottom = async (page: Page) => {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const scrapeJobLinks = async(event: Electron.IpcMainEvent, searchTerm: string ) => {
  const {browser, page} = await createRealBrowser()
  try{

    await blockUnnecessaryResources(page)
    page.setDefaultNavigationTimeout(0);
    await page.goto(`https://www.xing.com/jobs/search?keywords=${searchTerm}&sort=date&employmentType=FULL_TIME.ef2fe9&country=de.02516e`, {waitUntil: 'networkidle0'})
    const jobCountText = await page.$eval('h1[data-xds="Headline"]', el => el.textContent || '');
    const jobCount = parseInt(jobCountText.replace(/\D/g, ''), 10) || 0; 

    const SEARCH_LIMIT = Math.min(jobCount, 1000); 
    console.log(`SEARCH_LIMIT set to: ${SEARCH_LIMIT}`);

  

   
    let previousHeight = 0;
  const jobData = new Map<string, Date>()

 
  while (jobData.size <= SEARCH_LIMIT) {
    const html = await page.content()
    const $ = cheerio.load(html)
    const newResults = $('ol > li article').map((_i, article) => {
      const hrefText = $(article).find('a').attr('href')
      const dateText = $(article).find('p[class*="job-teaser-list-item-styles__Date"]').text().trim()
      const date = parseRelativeDate(dateText)
      const href = `https://www.xing.com${hrefText}`
    
      return {href, date}
    }).get().filter(item => item.href)

   
    newResults.forEach(({href, date}) => {
      if(href) jobData.set(href, date)
    })
    await scrollPageToBottom(page);
  
    console.log(`Current number of jobs ${jobData.size}`)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newHeight = await page.evaluate(() => document.body.scrollHeight);

    
    if (newHeight === previousHeight) {
      if(jobData.size >= (SEARCH_LIMIT - 20)){
        break;
      }else{
        continue
      }
      
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
  const searchReply = `Total ${saveJobs.length}/${jobData.size} job links scraped from ${searchTerm}`
  return event.reply('search-result', searchReply)
  
  }catch(error){
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
    console.error(`Error during scraping: ${errorMessage}`)
    return event.reply('search-error', errorMessage)
  }finally{
    await browser.close()
  }
}