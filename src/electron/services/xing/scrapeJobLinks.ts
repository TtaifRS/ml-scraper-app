import type { Page } from "rebrowser-puppeteer-core";
import { blockUnnecessaryResources, createRealBrowser } from '../puppteerConnection.js'

const scrollPageToBottom = async (page: Page) => {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
};



export const scrapeJobLinks = async(event: Electron.IpcMainEvent, searchTerm: string, searchLimit: number = 1000 ) => {
  const {browser, page} = await createRealBrowser()
  try{

    await blockUnnecessaryResources(page)
    page.setDefaultNavigationTimeout(0);
    await page.goto(`https://www.xing.com/jobs/search?keywords=${searchTerm}&sort=date&employmentType=FULL_TIME.ef2fe9&country=de.02516e`, {waitUntil: 'networkidle0'})


   
    let previousHeight = 0;
  const hrefs = new Set();

  console.log(searchLimit)
  while (hrefs.size <= searchLimit) {
    const newHrefs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("ul > li article a"));
      return links.map(link => link.href).filter(Boolean);
    });

    newHrefs.forEach(href => hrefs.add(href));

    await scrollPageToBottom(page);
    console.log(`Current number of jobs ${hrefs.size}`)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newHeight = await page.evaluate(() => document.body.scrollHeight);

    if (newHeight === previousHeight) {
      if(hrefs.size >= (searchLimit - 20)){
        break;
      }else{
        continue
      }
      
    }
    previousHeight = newHeight;
  }

  const uniqueLinks = Array.from(hrefs)
  return event.reply('search-results', uniqueLinks)
  
  }catch(error){
    console.error("puppeteer error:", error)
    if(error instanceof Error){
      return event.reply('search-error', error.message)
    }
    
  }finally{
    await browser.close()
  }
  

}