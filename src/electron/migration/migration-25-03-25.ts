import { getCurrentime } from '../helpers/getCurrentTime.js';
import Company, { ICompany } from '../models/company.model.js';
import Job from '../models/job.model.js';

export async function MigrateCompanyService() {
  console.log(`[${getCurrentime()}] Starting company service migration...`)

  try{
    const companies: ICompany[] = await Company.find().exec()
    console.log(`${getCurrentime()} Found ${companies.length} to process`)

    let companiesUpdated = 0 
    let companiesSkipped = 0
    let errors = 0 

    const comapniesArray = Array.from(companies)
    for(const [index, company] of comapniesArray.entries()){
      console.log(`[${getCurrentime()}] Processing company ${index + 1}/${companies.length}: ${company.name}`)

      try{
        const job = await Job.findOne({
          company: company._id,
          companyService: {$ne: null}
        }).exec()

        if(job && job.companyService){
          company.service = job.companyService
          await company.save()
          companiesUpdated++
        }else{
          companiesSkipped++
        }
      }catch(error){
        errors++
        console.error(error)
      }
    }

    console.log(`[${getCurrentime()}] Migration complet with summery`, {
      totalCompanies: companies.length,
      companiesUpdated,
      companiesSkipped,
      errors
    })
  }catch(error){
    console.error(error)
  }
}