import {HttpsProxyAgent} from 'https-proxy-agent'
import dotenv from 'dotenv'

dotenv.config()

const PROXY_LOGIN = process.env.PROXY_LOGIN
const PROXY_PASSWORD = process.env.PROXY_PASSWORD
const PROXY_HOST = process.env.PROXY_HOST 
const PROXY_PORT = process.env.PROXY_PORT 

export const httpsAgent = new HttpsProxyAgent(`http://${PROXY_LOGIN}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}/`)
