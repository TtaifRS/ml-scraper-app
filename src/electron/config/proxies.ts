import {HttpsProxyAgent} from 'https-proxy-agent'
import dotenv from 'dotenv'

dotenv.config()

// const PROXY_LOGIN = process.env.PROXY_LOGIN || "c7cf90963bdc9d996968"
// const PROXY_PASSWORD = process.env.PROXY_PASSWORD || "5d03ac1f70a23162"
// const PROXY_HOST = process.env.PROXY_HOST || "gw.dataimpulse.com"
// const PROXY_PORT = process.env.PROXY_PORT || 823
const PROXY_LOGIN = process.env.PROXY_LOGIN 
const PROXY_PASSWORD = process.env.PROXY_PASSWORD 
const PROXY_HOST = process.env.PROXY_HOST 
const PROXY_PORT = process.env.PROXY_PORT

export const httpsAgent = new HttpsProxyAgent(`http://${PROXY_LOGIN}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}/`)
