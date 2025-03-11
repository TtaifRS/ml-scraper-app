import { randomWait } from './randomWait.js'

const RETRY_LIMIT = 15
const DELAY_BETWEEN_REQUEST = [500, 1000]

export const withRetries = async <T>(fn: () => Promise<T>, retries: number = RETRY_LIMIT): Promise<T | null> => {
  for(let attempt = 0; attempt < retries; attempt++){
    try{
      return await fn()
    }catch(error){
      const errorMessage = error instanceof Error ? error.message : error
      console.log(`Retrying.. Attempt ${attempt + 1}/${retries} : ${errorMessage}`)
    }
    await randomWait(DELAY_BETWEEN_REQUEST[0], DELAY_BETWEEN_REQUEST[1])
  }

  return null
}