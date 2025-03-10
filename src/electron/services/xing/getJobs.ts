import { Job, IJob } from '../../models/job.model.js';

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