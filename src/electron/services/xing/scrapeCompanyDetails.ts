import axios from 'axios'
import * as cheerio from 'cheerio'
import UserAgent from 'user-agents'
import pLimit from 'p-limit'

import { httpsAgent } from '../../config/proxies.js'
import { withRetries } from '../../helpers/withRetries.js'
import { randomWait } from '../../helpers/randomWait.js'

import { getJobsWithCompanyURLandNullCompany } from './getJobs.js'
import Company from '../../models/company.model.js'
import { Job } from '../../models/job.model.js'


const CONCURRENCY_LIMIT = 25

interface CompanyData {
  profileUrl: string,
  name: string | null,
  slogan: string | null,
  service: string | null,
  xingFollowers: string | null,
  employees: string | null,
  ratings: string | null,
  employeeRecommendation: string | null,
  contactInfoName: string | null,
  contactInfoPosition: string | null,
  city: string | null,
  fullAddress: string | null,
  phoneNumber: string | null,
  email: string | null,
  website: string | null
}


const scrapeCompanyDetails = async(url:string) => {
  const companyData: CompanyData = {
    profileUrl: url,
    name: null,
    slogan: null,
    service: null,
    xingFollowers: null,
    employees: null,
    ratings: null,
    employeeRecommendation: null,
    contactInfoName: null,
    contactInfoPosition: null,
    city: null,
    fullAddress: null,
    phoneNumber: null,
    email: null,
    website: null
  }

  try{
    const {data:html} = await axios.get(url, {
      headers: {
        'User-Agent': new UserAgent({deviceCategory: 'desktop'}).toString(),
        'Accept': 'text/html'
      },
      httpAgent: httpsAgent,
      timeout: 60000
    })

    const $ = cheerio.load(html)

    companyData.name = $('h1[data-testid="PAGE_TITLE"]').text()
    companyData.slogan = $('p[data-testid = "PAGE_SLOGAN"]').text()
    companyData.xingFollowers = $('p[data-testid= "HEADER_FOLLOWERS_TOTAL"]').find('span').first().text()
    companyData.employees = $('p[data-testid="HEADER_COMPANY_SIZE"]').find('span').first().text()
    companyData.ratings = $('p[data-testid="HEADER_KUNUNU_RATING"]').find('span').first().text()

    const companyEmployeeRecommendationElContainer = $('div[class^="rating-styles__InnerBox"]')
    if (companyEmployeeRecommendationElContainer.length) {
      companyData.employeeRecommendation = companyEmployeeRecommendationElContainer.eq(1).find('p').first().text()
    }

    const companyContactInfoEl = $('div[class^="profile-info-styles__ContentContainer-sc"]').eq(4)
    if (companyContactInfoEl) {
      companyData.contactInfoName = companyContactInfoEl.find('div > strong').text()
      companyData.contactInfoPosition = companyContactInfoEl.find('p').eq(0).text()
    }

    const companyLocationAdressCardEl = $('div[data-testid="locations-address-card"]')

    companyData.city = companyLocationAdressCardEl.find('p[class*="location-styles__MapHeadline-sc"]') ? companyLocationAdressCardEl.find('p[class*="location-styles__MapHeadline-sc"]').text() : ""

    companyData.fullAddress = companyLocationAdressCardEl.find('p[class*="location-styles__Address-sc"]') ? companyLocationAdressCardEl.find('p[class*="location-styles__Address-sc"]').text() : ""

    companyData.phoneNumber = companyLocationAdressCardEl.find('a[class*="location-styles__PhoneButton-sc"]').attr('href')?.replace(/^tel:/, '') || "" 
    companyData.email = companyLocationAdressCardEl.find('div[class="allContactsWrapper"] > div').eq(1).find('a').attr('href')?.replace(/^mailto:/, '') || ""

    companyData.website = companyLocationAdressCardEl.find('div[class="allContactsWrapper"] > div').eq(2).find('a').attr('href') || ""
    

    console.log(`Successfully scraped company: ${companyData.name}`)

    return companyData

  }catch(error){
    const errorMessage = error instanceof Error ? error.message : error
    console.error(`Error during scraping: ${errorMessage}`)
    throw Error
  }
}

const scrapeCompanyWithRetries = async(url: string) => {
  return await withRetries(() => scrapeCompanyDetails(url))
}

const getUniqueCompanyUrls = async(): Promise<string[]> => {
  const jobs = await getJobsWithCompanyURLandNullCompany()
  const uniqueUrls = new Set(jobs.map(job => job.companyUrl!))
  return Array.from(uniqueUrls)
}

export default async function scrapeCompnayAndUpdateDB(event: Electron.IpcMainEvent) {
  try {
    const companyUrls = await getUniqueCompanyUrls()

    if(companyUrls.length === 0) {
      console.log('No company url found to scrape')
      return
    }

    const limit = pLimit(CONCURRENCY_LIMIT)
    const results: CompanyData[] = []

    await Promise.all(
      companyUrls.map((companyUrl, index) => limit(async() => {
        console.log(`Scraping company ${index + 1}/ ${companyUrls.length}`)

        const exisitingCompany = await Company.findOne({profileUrl: companyUrl})

        if(!exisitingCompany) {
          const companyData = await scrapeCompanyWithRetries(companyUrl)

          if(companyData && companyData.name){
            const newCompany = await Company.create(companyData)

            results.push(newCompany)

            await Job.updateMany({companyUrl}, {company: newCompany._id})

            console.log(`Stored company in database: ${companyData.name}`)
          }
          
        }else{
          console.log(`Company already exists: ${exisitingCompany.name}`)
        }
        await randomWait(500, 1000)
      })
    )
  )

  console.log('All companies processed')
  return event.reply('scrape-companies-result', `Total company details scraped ${results.length}`)

  }catch(error){
    if(error instanceof Error){
      console.error("Scraping error:", error.message)
      return event.reply('scrape-companies-error', error.message)
    }else{
      console.error('Scraping error', error)
    } 
    throw Error
  }
}