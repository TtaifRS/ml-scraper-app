import fs from 'fs'
import {format} from 'fast-csv'
import { getJobswithComapnayInfo } from './rest/getJobs.js'  
import { dialog } from 'electron'
import { ICompany } from '../../models/company.model.js'



export default async function exportJobsToCSV(event: Electron.IpcMainEvent) {
  try{
    const jobs = await getJobswithComapnayInfo()
    console.log(`Jobs length: ${jobs.length}`)
    if(jobs.length === 0 ){
      console.log('No jobs found to export!')
      return event.reply('download-csv-result', 'No jobs found')
    }

    const {filePath} = await dialog.showSaveDialog({
      buttonLabel: 'Save CSV',
      defaultPath: `Jobs_${Date.now()}.csv`,
      filters: [{name: 'CSV Files', extensions: ['csv']}]
    })

    if(!filePath){
      return event.reply('download-csv-error', `Please choose a location to save the CSV`)
    }

    const MAX_ROWS = 20000 
    const totalParts = Math.ceil(jobs.length / MAX_ROWS)

    for (let i = 0; i < totalParts; i++){
      const chunk = jobs.slice(i* MAX_ROWS, (i + 1) * MAX_ROWS)

      if(chunk.length === 0) continue

      const fileName = filePath.includes('.csv') ? filePath.replace(/\.csv$/, `_Part${i+1}.csv`) : `${filePath}_Part${i+1}.csv`

      await new Promise<void>((resolve, reject) => {
        const ws = fs.createWriteStream(fileName)
        const csvStream = format({headers: true})
        csvStream.pipe(ws)
        chunk.forEach((job) => {
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
          console.log(`Csv file saved at: ${fileName}`)
          
          event.reply('download-csv-result', `CSV saved at: ${fileName}`)
          resolve()
        })

        ws.on('error', reject)
      })     
    } 
  }catch(error){
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong!'
    console.log(errorMessage)
    console.log(error)
    return event.reply('download-csv-error', errorMessage)
  }
}