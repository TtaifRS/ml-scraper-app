import axios from 'axios'
import * as cheerio from 'cheerio'
import UserAgent from 'user-agents'
import pLimit from 'p-limit'

import { httpsAgent } from '../../config/proxies.js'
import { Job } from '../../models/job.model.js'
import { withRetries } from '../../helpers/withRetries.js'
import { getJobsToScrape } from './getJobs.js'
import { randomWait } from '../../helpers/randomWait.js'
import { getCurrentime } from '../../helpers/getCurrentTime.js'


const CONCURRENCY_LIMIT = 25

interface JobData {
    title?: string | null,
    companyName?: string | null,
    companyUrl?: string | null,
    companyService?: string | null,
    location?: string | null,
    jobVerified: boolean,
    jobType?: string | null,
    salary?: string | null,
    salaryProvidedByCompany: boolean,
    description?: string | null,

}


const scrapeJobDesc = async(url: string) => {
  const jobData: JobData = {
    title: null,
    companyName: null,
    companyUrl: null,
    companyService: null,
    location: null,
    jobVerified: false,
    jobType: null,
    salary: null,
    salaryProvidedByCompany: false,
    description: null
  }
  

  try{
    const {data: html} = await axios.get(url, {
      headers: {
        'User-Agent': new UserAgent({deviceCategory: 'desktop'}).toString(),
        'Accept': 'text/html'
      },
      httpAgent: httpsAgent,
      timeout: 60000
    })


    const $ = cheerio.load(html)

    const getTextContent = (selector: string, parent= $) => {
      const element = parent(selector)
      return element.length ? element.text().trim() : null
    }

    jobData.title = getTextContent('h1[data-xds="Hero"]')
    jobData.companyName = getTextContent('p[data-testid="job-details-company-info-name"]')

    const companyURLElement = $('div[data-testid="job-details-job-intro"] a')
    jobData.companyUrl = companyURLElement.length ? `https://www.xing.com${companyURLElement.attr('href')}` : null

    const companyServiceElements = $('div[data-testid="job-details-job-intro"] > div')

    if (companyServiceElements.length > 1) {
      const companyServiceElement = companyServiceElements.eq(1).find('p').eq(1)
      jobData.companyService = companyServiceElement.length ? companyServiceElement.text().trim() : null
    }

    jobData.location = getTextContent('li[data-testid="job-fact-location"]')

    const jobVerifyElement = $('li[data-testid="job-fact-xing-verified"]')
    if(jobVerifyElement.length) {
      jobData.jobVerified = true
    }

    jobData.jobType = getTextContent('li[data-testid="job-fact-employment-type"]')

    jobData.salary = getTextContent('li[data-testid="job-fact-salary"]')

    const aboutSectionElements = $('section[class^="legacy-containers__StyledContainer"]').eq(1)

    if (aboutSectionElements.length) {
      const aboutSectionDiv = aboutSectionElements.find('div[class^="item__StyledItem-sc"]').first()

      if (aboutSectionDiv.length) {
        jobData.description = aboutSectionDiv.text().trim().replace(/\s+/g, ' ')
      }
    }

    console.log(`Successfully scraped job: ${jobData.title}`)
    return jobData

  }catch(error){
    const errorMessage = error instanceof Error ? error.message : error
    console.error(`Error during scraping: ${errorMessage}`)
    throw Error
  }

}

const scrapeJobWithRetries = async(url: string) => {
  return await withRetries(() => scrapeJobDesc(url))
}

export default async function scrapeJobAndUpdateDB(event: Electron.IpcMainEvent) {
  try{
    const jobs = await getJobsToScrape()

    if(jobs.length === 0){
      console.log('No jobs found to scrape')
      return
    }

    const limit = pLimit(CONCURRENCY_LIMIT)
    const results: JobData[] = []

    await Promise.all(
      jobs.map((job, index) => limit(async() => {
        console.log(`Scraping job ${index + 1}/ ${jobs.length}`)
        event.reply('scrape-jobs-progress', `[${getCurrentime()}] Scraping job ${index + 1}/ ${jobs.length}`)
        const jobData = await scrapeJobWithRetries(job.link)

        if(jobData && jobData.title){
          await Job.updateOne(
            {_id: job._id},
            {$set: jobData}
          )
          results.push(jobData)
          console.log(`Updated job in database: ${jobData.title}`)
        }

        await randomWait(500, 1000)
      }))
    )
    
    console.log('All jobs processed succesfully')
    event.reply('scrape-jobs-result', `[${getCurrentime()}] Total jobs scraped ${results.length}`)

  }catch(error){
    if(error instanceof Error){
      console.error("Scraping error:", error.message)
      return event.reply('scrape-jobs-error', error.message)
    }else{
      console.error('Scraping error', error)
    } 
    throw Error
  }
} 