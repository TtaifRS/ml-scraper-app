
import {subHours, subDays} from 'date-fns'

export const parseRelativeDate = (dateText: string): Date => {
  const now = new Date()

  dateText = dateText.toLowerCase().trim()

  if(dateText === 'just now'){
    return now
  }else if(dateText.endsWith('hour ago') || dateText.endsWith('hours ago')){
    const hours = parseInt(dateText.split(' ')[0])
    return subHours(now, hours)
  }else if(dateText === 'yesterday'){
    return subDays(now, 1)
  }else if(dateText.endsWith('days ago')){
    const days = parseInt(dateText.split(' ')[0])
    return subDays(now, days)
  }else if(dateText === '30+ days ago'){
    return subDays(now, 30)
  }

  if(dateText === 'gerade eben'){
    return now
  }else if(dateText.startsWith('vor') && dateText.endsWith('stunde') || dateText.endsWith('stunden')){
    const hours = parseInt(dateText.split(' ')[1])
    return subHours(now, hours)
  }else if(dateText === 'gestern'){
    return subDays(now, 1)
  }else if(dateText.startsWith('vor') && dateText.endsWith('tag') || dateText.endsWith('tage') || dateText.endsWith('tagen')){
    const days = parseInt(dateText.split(' ')[1])
    return subDays(now, days)
  }else if(dateText === 'vor 30+ tagen'){
    return subDays(now, 30)
  }
  
  console.warn(`Unable to parse date string: ${dateText}, using current date as fallback`)
  return now
}