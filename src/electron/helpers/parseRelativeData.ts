
import {subHours, subDays} from 'date-fns'

export const parseRelativeDate = (dateText: string): Date => {
  const now = new Date()
  const text = dateText.toLowerCase().trim()


  if(/^(just now | gerade eben)/.test(text)){
    return now
  } else if(/^(yesterday | gestern)/.test(text)){
    return subDays(now, 1)
  } else if(/^(30+ days ago | vor 30+ tagen)/.test(text)){
    return subDays(now, 30)
  } else {
    const match = text.match(/\d+/)
    const num = match ? parseInt(match[0], 10) : 0

    if(/(hour | hours | stunde | stunden)/.test(text)) return subHours(now, num)
    if(/(day | day | tag | tagen)/.test(text)) return subDays(now, num)

    console.warn(`Unknown date format: "${dateText}" - using current date`)  
    return now
  }
  
}