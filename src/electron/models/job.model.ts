import {Schema, model, Document, Types} from 'mongoose'
import { ICompany } from './company.model.js'
export interface IJob extends Document{
  title: string,
  link: string,
  category: string,
  companyName: string,
  companyUrl?: string | null,
  companyService?: string | null,
  company?: Types.ObjectId | ICompany | null,
  location?: string | null,
  jobVerified: boolean,
  jobType?: string | null,
  salary?: string | null,
  salaryProvidedByCompany: boolean,
  description?: string | null,
  postingDate?: Date | null,
  createdAt: Date,
  updatedAt: Date
}


const JobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: false,
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: false
  },
  jobVerified: {
    type: Boolean,
    default: false,
    required: true
  },
  jobType: {
    type: String,
    required: false,
  },
  salary: {
    type: String,
    required: false
  },
  salaryProvidedByCompany: {
    type: Boolean,
    default: false,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    default: null
  },
  companyUrl: {
    type: String,
    default: null
  },
  companyService: {
    type: String,
    required: false
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  postingDate: {
    type: Date,
    required: true,
  }
}, { timestamps: true })


export const Job = model<IJob>('Job', JobSchema)