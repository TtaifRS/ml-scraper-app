import { Types } from 'mongoose';
import Company from '../models/company.model.js';
import Job from '../models/job.model.js';



export async function MigrateCompanyJobs() {

  const companies = await Company.find()

  for (const company of companies){
    const jobs = await Job.find({company: company._id}).exec()
    company.jobs = jobs.map(job => job._id as Types.ObjectId)
    await company.save()
  }

  console.log('Migration Complete')
}

