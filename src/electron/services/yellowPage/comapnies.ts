import UserAgent from 'user-agents';
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import pLimit from 'p-limit';
import * as cheerio from 'cheerio'

import { httpsAgent } from '../../config/proxies.js';
import { randomWait } from '../../helpers/randomWait.js';
import GelbeseitenCompany, { IGelbeseitenCompany } from '../../models/gelbeseitenCompany.model.js';
import { getCurrentime } from '../../helpers/getCurrentTime.js';


const YELLOW_PAGE_PROGRESS_URL = "scrape-yellowpage-progress"

interface Config{
  requestDelay: number,
  maxRetries: number,
  resultPerPage: number,
  concurrencyLimitForListing: number,
  concurrencyLimitForCompany: number,
  minDelay: number,
  maxDelay: number,
  headers: Record<string, string>,
  BASE_URL: string
}

interface Listing{
  name: string,
  link?: string,
  category: string,
  subCategory: string,
  industry: string
}

interface SocialMedia {
  platform: string,
  platformLink: string
}

interface CompanyAdditionalInfo{
  infoTitle: string,
  info: string[]
}


interface CompanyInfo {
  name: string,
  gelbeseitenLink: string,
  category: string,
  subCategory: string,
  industry: string,
  industryFull: string,
  logo?: string,
  city?: string,
  rating?: string,
  reviewCount?: string,
  address?: string,
  telephoneNumber?: string,
  fax?: string,
  email?: string,
  website?: string,
  socialMedia: SocialMedia[],
  businessCard?: string,
  aboutUs: string,
  companyAdditionalInfo: CompanyAdditionalInfo[],
  brochureURL: string
}

interface ScrapeResult {
  total: number,
  success: number,
  failed:number
}

interface ScrapeError extends Error {
  details?: unknown
}

const CONFIG: Config = {
  requestDelay: 2000,
  maxRetries: 3,
  resultPerPage: 10,
  concurrencyLimitForListing: 10,
  concurrencyLimitForCompany: 25,
  minDelay: 1000,
  maxDelay: 3000,
  headers: {
    'User-Agent': new UserAgent().toString(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signe',
    'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,bn;q=0.7'
  },
  BASE_URL: 'https://www.gelbeseiten.de/'
}

const client = axios.create({
  headers: CONFIG.headers,
  httpsAgent: httpsAgent,
  timeout: 3000,
})

async function retryableRequest(config: AxiosRequestConfig, retries: number = CONFIG.maxRetries): Promise<AxiosResponse> {
  try{
    await new Promise(resolve => setTimeout(resolve, CONFIG.requestDelay))
    const response = await client(config)
    return response
  }catch(error){
    if(retries > 0){
      const delay = Math.pow(2, CONFIG.maxRetries - retries) * 1000 
      console.log(`Retrying... (${retries} left)`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryableRequest(config, retries -1)
    }
    throw error as AxiosError
  }
}

async function getListings(event: Electron.IpcMainEvent, industryName: string, cityName: string = "", category: string, subCategory: string): Promise<Listing[]>{
  const limit = pLimit(CONFIG.concurrencyLimitForListing)
  const listings:Listing[] = []
  try{
    
    event.reply(YELLOW_PAGE_PROGRESS_URL, `[${getCurrentime()} Starting search for ${industryName}]`)
    const initialParams = new URLSearchParams({WAS: industryName, WO: cityName})
    const initialResponse = await retryableRequest({
      method: 'POST',
      url: `${CONFIG.BASE_URL}suche`,
      data: initialParams.toString(),
      headers: CONFIG.headers
    })

    const $ = cheerio.load(initialResponse.data)

    if($('div.errorpage-content').length > 0){
      console.log('No lisiting found!')
      return []
    }

    $('article.mod.mod-Treffer').each((_i, el) => {
      const link = $(el).find('a').first().attr('href')
      const name = $(el).find('h2.mod-Treffer__name').text().trim()
      listings.push({name, link, category, subCategory, industry: industryName})
    })


    const totalNumberText = $('#mod-TrefferlisteInfo').text().trim()
    const totalNumberOfCompany = parseInt(totalNumberText, 10)
     console.log(`Total Number of company: ${totalNumberOfCompany}`)

    if(totalNumberOfCompany > 50){
      const ajaxRequests = []

      const remainingResults = totalNumberOfCompany - 50
      const ajaxRequestNeeded = Math.ceil(remainingResults / CONFIG.resultPerPage)

      for (let i = 0; i < ajaxRequestNeeded; i++) {
        const position = 51 + (i * CONFIG.resultPerPage)
        ajaxRequests.push(position)
      }

      const promises = ajaxRequests.map(position => 
        limit(
          async()=>{
            try{
              const ajaxParams = new URLSearchParams({
                umkreis: '-1',
                verwandt: 'false',
                WAS: industryName,
                WO: cityName,
                position: position.toString(),
                anzahl: '10',
                sortierung: 'relevanz'
              })
              const ajaxResponse = await retryableRequest({
                method: 'POST',
                url: `${CONFIG.BASE_URL}ajaxsuche`,
                data: ajaxParams.toString(),
                headers: CONFIG.headers
              })  
              const $$ = cheerio.load(ajaxResponse.data.html)
              $$('article.mod.mod-Treffer').each((_, element) => {
                  const aTag = $$(element).find('a').first()
                  const href = aTag.attr('href')
                  const name = aTag.find('h2.mod-Treffer__name').text().trim()
                  listings.push({
                    name,
                    link: href,
                    category, 
                    subCategory, 
                    industry: industryName
                  })
                })
            }catch(error){
              console.log(error)
            }
            return listings
          })
        )
        await Promise.all(promises)
     }
     return listings
  }catch(error){
    console.log(error)
    return []
  }
}


async function getCompanyInformation(event:Electron.IpcMainEvent, listings: Listing[]){
  try{
    const limit = pLimit(CONFIG.concurrencyLimitForCompany)
 
    event.reply(YELLOW_PAGE_PROGRESS_URL, `[${getCurrentime()}] processing ${listings.length} companies...`)
    const companies = await Promise.all(listings.map((listing, index) =>
      limit(async() => {
        try{
          await randomWait(CONFIG.minDelay, CONFIG.maxDelay)
          console.log(`Processing ${index + 1}/${listings.length}: ${listing.name}`)

          const response = await retryableRequest({
            method: 'GET',
            url: listing.link,
            headers: CONFIG.headers
          })
          const $ = cheerio.load(response.data)
          const companyInfo: CompanyInfo = {
            name: "",
            gelbeseitenLink: "",
            category: "",
            subCategory: "",
            industry: "",
            industryFull: "",
            logo: "",
            city: "",
            rating: "",
            reviewCount: "",
            address: "",
            telephoneNumber: "",
            fax: "",
            email: "",
            website: "",
            socialMedia: [],
            businessCard: "",
            aboutUs: "",
            companyAdditionalInfo: [],
            brochureURL: ""
          }

          companyInfo.name = listing.name
          companyInfo.gelbeseitenLink = listing.link || '' 
          companyInfo.category = listing.category
          companyInfo.subCategory = listing.subCategory
          companyInfo.industry = listing.industry

          companyInfo.logo = $('img.mod-TeilnehmerKopf__logo--image').attr('src') || ''

          const breadCrumbUl = $('ul.mod-Breadcrumb__list').eq(1)
          if (breadCrumbUl.length) {
            companyInfo.city = breadCrumbUl.find('li.mod-Breadcrumb__list-item:last-child span.mod-Breadcrumb-attribut--detailseite').text().trim()

          }

          const ratingLink = $('a.mod-TeilnehmerKopf__bewertungen')
          if (ratingLink.length) {
            companyInfo.rating = ratingLink.find('div.mod-Stars').attr('title') || ''
            companyInfo.reviewCount = ratingLink.find('span').eq(2).text().trim()

          }

          companyInfo.address = $('div.adresse-text').text().trim().replace(/\s+/g, ' ')
          
          
          const telephoneNumberEl = $('div.mod-Kontaktdaten__list-item.contains-icon-big-tel span[data-role="telefonnummer"]')

          if(telephoneNumberEl.length > 0){
            companyInfo.telephoneNumber = telephoneNumberEl.attr('data-suffix')?.replace(/\s/g, '') || ''
          }


          companyInfo.fax = $('div.mod-Kontaktdaten__list-item.contains-icon-big-fax span').text().trim().replace(/\s/g, '') || ''


          const emailData = $('#email_versenden').attr('data-link') || ''
          companyInfo.email = emailData.replace(/mailto:|%20/g, '').split('?')[0]


          companyInfo.website = $('div.mod-Kontaktdaten__list-item.contains-icon-big-homepage a').attr('href') || ''

          const socialMediaElms = $('div.mod-Kontaktdaten__social-media-iconlist a')
          if (socialMediaElms.length) {
            socialMediaElms.each((_, el) => {
              let platform = ""
              const platformLink = $(el).attr('href') || ''
              const platformClass = $(el).find('span').attr('class') || ""
              if (platformClass === 'icon-social') {
                platform = 'Social Media'
              } else {
                platform = platformClass.replace('icon-social_', '')
              }

              const socialMedia = {
                platform,
                platformLink
              }
              companyInfo.socialMedia.push(socialMedia)
            })
          }

          companyInfo.businessCard = $('img.mod-ImWeb__image').attr('src') || ''

          const aboutSection = $('#beschreibung div.mod-Beschreibung')
          if (aboutSection.length) {
            companyInfo.aboutUs = aboutSection.find('div').first().text().trim()

          }

          const additionInfoSection = $('#weitere_unternehmensinformationen div.mod-WeitereUnternehmensInfos')
          if (additionInfoSection.length) {
            const infoBlocks = additionInfoSection.find('div.gc-text--h3, ul.list-unstyled')
            let currentTitle = ''

            infoBlocks.each((_, el) => {
              if ($(el).is('div.gc-text--h3')) {
                currentTitle = $(el).text().trim().split(':')[0]
              } else if (currentTitle) {
                const infoItems: string[] = []
                $(el).find('li').each((index, liEl) => {
                  infoItems.push($(liEl).text().trim())
                })
                companyInfo.companyAdditionalInfo.push({
                  infoTitle: currentTitle,
                  info: infoItems
                })

                currentTitle = ''
              }
            })
          }


          const brochureSection = $('#broschuere_und_katalog div.mod-Broschure')
          if (brochureSection.length) {
            companyInfo.brochureURL = brochureSection.find('a.mod-Broschure__button').attr('href') || ''
          }
          return companyInfo
        }catch(error){
          console.log(error)
          return {} as CompanyInfo
        }
      })
    ))
    return companies.filter(company => Object.keys(company).length > 0)
  }catch(error){
    console.log(error)
    return []
  }
}

export async function scrapeYellowPage(event: Electron.IpcMainEvent, industryName: string, cityName: string, category: string, subCategory: string ): Promise<ScrapeResult>{
  try{
    const listings: Listing[] = await getListings(event, industryName, cityName, category, subCategory)
    const comapnies: CompanyInfo[] = await getCompanyInformation(event, listings)

    const savePromises: Promise<boolean>[] = comapnies.map(async (company: CompanyInfo) => {
     try{
      const result = await GelbeseitenCompany.findOneAndUpdate(
        {gelbeseitenLink: company.gelbeseitenLink},
        company as IGelbeseitenCompany,
        {upsert: true, new: true, runValidators: true}
      )
      return !!result
     }catch(error: unknown){
      const err = error as Error
      console.error(`Error saving ${company.name}: ${err.message}`)
      if(err.name === 'ValidationError'){
        console.error('Validation Errors:', (error as unknown))
      }
      return false
     }
    })
    const result: boolean[] = await Promise.all(savePromises)
    const sucessCount: number = result.filter(Boolean).length

    return{
      total: comapnies.length,
      success: sucessCount,
      failed: comapnies.length - sucessCount
    }
  }catch(error: unknown){
    const err: ScrapeError = new Error('Scraping Failed')
    err.details = error
    console.error(`Scraping Failed: ${error}`)
    throw err
  }
}

