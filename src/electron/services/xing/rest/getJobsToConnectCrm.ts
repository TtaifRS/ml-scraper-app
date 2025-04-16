import Job, { IJob } from '../../../models/job.model.js';
import { ICompany } from '../../../models/company.model.js';
import axios, { AxiosError } from 'axios';

import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { isDev } from '../../../utils.js';
import path from 'path';
import { randomWait } from '../../../helpers/randomWait.js';
import { getCurrentime } from '../../../helpers/getCurrentTime.js';

const envPath = isDev() ? '.env' : path.join(process.resourcesPath, '.env');
dotenvExpand.expand(dotenv.config({ path: envPath }));

const EVENT_PROGRESS_URL = 'connect-xing-crm-progress';
const EVENT_SUCCESS_URL = 'connect-xing-crm-successfull';
const EVENT_ERROR_URL = 'connect-xing-crm-error';


const WEBHOOK_URL = process.env.WEBHOOK_URL || ""

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;

interface WebhhokPayload {
  job_title: string;
  website_url: string;
  company_name: string;
  job_location: string | null;
  date_job_posted: Date | null;
  anstellungsart: string | null;
  company_link: string | null;
  job_link: string | null;
  job_description: string | null;
}

interface ProcessingResult {
  success: boolean;
  processedCount: number;
  message?: string;
  error?: string;
}

interface PopulatedJob extends Omit<IJob, 'company'> {
  company: ICompany & { website: string };
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    return withRetry(fn, retries - 1);
  }
}

export async function processJobsToCRM(dryRun: boolean, event: Electron.IpcMainEvent): Promise<ProcessingResult> {
  event.reply(EVENT_PROGRESS_URL, `[${getCurrentime()}] Starting the connection process`);
  try {
    const jobs = await Job.aggregate<PopulatedJob>([
      {
        $match: {
         $and: [
          { company: { $exists: true, $ne: null } },
          { $or: [
            { crmConnectionFailed: false }, 
            { crmConnectionFailed: { $exists: false } }
          ]},
          { $or: [
            { crmConnection: false }, 
            { crmConnection: { $exists: false } }
          ]},
          {companyService: {$ne: 'Personaldienstleistungen und -beratung'}}
         ]
        }
      },
      {
        $lookup: {
          from: 'companies', 
          localField: 'company',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $unwind: '$company'
      },
      {
        $match: {
          'company.website': { $exists: true, $ne: '' },
          
        }
      },
      {
        $limit: 50000
      }
    ]).exec();

    if (dryRun) {
      console.log(`Dry run: Found ${jobs.length} jobs with valid companies having websites`);
    }
    event.reply(EVENT_PROGRESS_URL, `[${getCurrentime()}] Found ${jobs.length} jobs with valid companies having websites`);
    let processedCount = 0;
    const bulkOperations: mongoose.AnyBulkWriteOperation[] = [];

    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      if (dryRun) {
        console.log(`Dry run: Processing batch ${i / BATCH_SIZE + 1} with ${batch.length} jobs`);
      }

      await Promise.all(
        batch.map(async (job: PopulatedJob) => {
          const payload: WebhhokPayload = {
            job_title: job.title,
            website_url: job.company.website,
            company_name: job.company.name,
            job_location: job.location || null,
            date_job_posted: job.postingDate || null,
            anstellungsart: job.jobType || null,
            company_link: job.companyUrl || null,
            job_link: job.link,
            job_description: job.description === 'To be scraped' ? '' : job.description || null
          };

          if (dryRun) {
            console.log(`Dry run: Would send payload for job ${job._id}:`, job);
            console.log(`Dry run: Would update job ${job._id} to set crmConnection to true`);
            processedCount++;
          } else {
            try {
              await randomWait(2000, 4000);
              const response = await withRetry(() => axios.post(WEBHOOK_URL, payload));

           

              if (response.status === 200 && !response.data.error) {
                event.reply(EVENT_PROGRESS_URL, `[${getCurrentime()}] (${processedCount + 1} / ${jobs.length}): ${job.title} from ${job.company.name}, ${job.location} successfully added to CRM`);
                bulkOperations.push({
                  updateOne: {
                    filter: { _id: job._id as Types.ObjectId },
                    update: { $set: { crmConnection: true } }
                  }
                });
              } else {
                console.log(`${response.data.error.message} - ${job.companyName}`);
                event.reply(EVENT_PROGRESS_URL, `[${getCurrentime()}] (${processedCount + 1} / ${jobs.length}): ${job.title} from ${job.company.name}, ${job.location} couldn't be added to CRM`);
                bulkOperations.push({
                  updateOne: {
                    filter: { _id: job._id as Types.ObjectId },
                    update: { $set: { crmConnectionFailed: true } }
                  }
                })
              }
              processedCount++;
            } catch (error) {
              const axiosError = error as AxiosError;
              console.log(`Failed for job ${job._id}`, {
                status: axiosError.response?.status,
                data: axiosError.response?.data
              });
              event.reply(EVENT_ERROR_URL, `[${getCurrentime()}] ${job.title} from ${job.company.name}, ${job.location} couldn't be added to CRM due to Statuscode: ${axiosError.response?.status} error`);
            }
          }
        })
      );
    }

    if (!dryRun && bulkOperations.length > 0) {
      await Job.bulkWrite(bulkOperations);
    }
    await Job.deleteMany({$or: [{ crmConnection: true}, {company: null }]});
    const message = dryRun ? `Dry run: Would have processed ${processedCount} jobs` : `Processed ${processedCount} jobs`;
    event.reply(EVENT_SUCCESS_URL, `[${getCurrentime()}] ${message}`);
    return {
      success: true,
      processedCount,
      message
    };
  } catch (error) {
    const err = error as Error;
    console.log(`Error in processJobsToCRM: ${err.message}`);
    event.reply(EVENT_ERROR_URL, `[${getCurrentime()}] Error in connecting jobs to CRM: ${err.message}`);
    return {
      success: false,
      processedCount: 0,
      error: err.message
    };
  }
}



