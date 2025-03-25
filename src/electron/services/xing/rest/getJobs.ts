import Company from '../../../models/company.model.js';
import Job, { IJob } from '../../../models/job.model.js';

export async function getJobsToScrape(): Promise<IJob[]> {
  try{
    const jobs = await Job.find({
      $or: [
        {title: {$exists: false}},
        {title: null},
        {title: ''}
      ]
    })

    return jobs
  }catch(error){
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occured' 
    console.error(`Error fetching jobs: ${errorMessage}`)
    throw error
  }
}


export async function getJobsWithCompanyURLandNullCompany():Promise<IJob[]> {
  try{
    const jobs = await Job.find({
      $and: [
        {
          companyUrl: {
            $exists: true,
            $ne: null,
          }
        },
        {company: null}
      ]
    })

    return jobs
  }catch(error){
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occured' 
    console.error(`Error fetching jobs: ${errorMessage}`)
    throw error
  }
}


export  async function getJobswithComapnayInfo(): Promise<IJob[]> {
  try{

    const jobs = await Job.find({}).populate<{company: IJob['company']}>('company').lean()
    if(jobs.length === 0){
      console.log('No Jobs found')
      return []
    }
    console.log(`Fetched ${jobs.length} jobs with company details`)
    return jobs
  }catch(error){
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occured' 
    console.error(`Error fetching jobs: ${errorMessage}`)
    throw error
  }
}

export async function cleanPhoneNumbers(){
  try{
    await Company.updateMany(
      {phoneNumber: {$regex: /^%/}},
      [
        {
          $set: {
            phoneNumber: {
              $substr: ['$phoneNumber', 1, -1]
            }
          }
        }
      ]
    )

    console.log('Telephone numbers cleaned succesfully')
  }catch(error){
    console.log(error)
  }
}