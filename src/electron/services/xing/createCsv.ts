import fs from 'fs'
import {format} from 'fast-csv'
import { getJobswithComapnayInfo } from './getJobs.js'  
import { dialog } from 'electron'
import { ICompany } from '../../models/company.model.js'


export default async function exportJobsToCSV(event: Electron.IpcMainEvent) {
  try{
    const jobs = await getJobswithComapnayInfo()

    if(jobs.length === 0 ){
      console.log('No jobs found to export!')
      return event.reply('download-csv-result', 'No jobs found')
    }

    const {filePath} = await dialog.showSaveDialog({
      buttonLabel: 'Save CSV',
      defaultPath: `Jobs_${Date.now()}.csv`,
      filters: [{name: 'CSV Files', extensions: ['csv']}]
    })

    if(filePath){
      const ws = fs.createWriteStream(filePath)

      const csvStream = format({headers: true})

      csvStream.pipe(ws)

      jobs.forEach((job) => {
        const company = job.company as ICompany | null
        csvStream.write({
          Title: job.title,
          Link: job.link,
          Location: job.location,
          Verified: job.jobVerified ,
          Type: job.jobType,
          Salary: job.salary,
          Description: job.description,
          "Posting-Date": job.postingDate,
          "Company-Name": job.companyName,
          "Company-URL": job.companyUrl,
          "Company-Service": job.companyService,
          "Company-Slogan": company?.slogan || 'N/A',
          "Xing-Followers": company?.xingFollowers || 'N/A',
          Employees: company?.employees || 'N/A',
          Ratings: company?.ratings || 'N/A',
          "Employee-Recommendation": company?.employeeRecommendation || 'N/A',
          "ContactInfo-Name": company?.contactInfoName || 'N/A',
          "ContactInfo-Position": company?.contactInfoPosition || 'N/A',
          City: company?.city || 'N/A',
          Fulladdress: company?.fullAddress || 'N/A',
          Phonenumber: company?.phoneNumber || 'N/A',
          Email: company?.email || 'N/A', 
          Website: company?.website || 'N/A',
        })
      })

      csvStream.end()

      ws.on('finish', () => {
        console.log(`Csv file saved at: ${filePath}`)
        return event.reply('download-csv-result', `CSV saved at: ${filePath}`)
      })
    }else {
      return event.reply('download-csv-result', `Please choose a location to save the CSV`)
    }
   
  }catch(error){
    console.log(error)
  }
}