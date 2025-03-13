import type { Page } from "rebrowser-puppeteer-core";

import { connect } from 'puppeteer-real-browser'
import UserAgent from 'user-agents';


export const createRealBrowser = async () => {
  const defaultOptions = {
    headless: true,
    args: [
      '--start-maximized',
      '--lang=en-US,en',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',

    ],
    fingerprint: true,
    turnstile: true,
    proxy: {
          host: process.env.PROXY_HOST || '' ,
          port: process.env.PORT ? parseInt(process.env.PORT, 10) : 0 ,
          username: process.env.PROXY_LOGIN || '' ,
          password: process.env.PROXY_PASSWORD || '' 
        },
    userAgent: new UserAgent({ deviceCategory: 'desktop' }).toString()
  }
  try {
    const response = await connect(defaultOptions)
    const { browser, page } = response

    return { browser, page }
  } catch (error) {
    console.error(`Failed to launch the browser: ${error}`)
    throw error
  }
}

export const blockUnnecessaryResources = async (page: Page) => {
  page.removeAllListeners('request')

  await page.setRequestInterception(true)

  page.on('request', (request) => {
    try {
      const resourceType = request.resourceType()
      if (['image', 'font', 'media'].includes(resourceType)) {
        request.abort()
      } else {
        request.continue()
      }
    } catch (error) {
      if(error instanceof Error){
        console.error(`Error intercepting request: ${error.message}`)
      }
   
      if (!request.isInterceptResolutionHandled()) {
        request.continue()
      }
    }
  })
}

