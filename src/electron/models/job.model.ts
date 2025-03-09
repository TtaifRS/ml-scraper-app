import {Schema, model, Document, Types} from 'mongoose'

export interface IJob extends Document{
  title: string,
  link: string,
  companyName: string,
  company?: Types.ObjectId | null,
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
    required: true,
  },
  link: {
    type: String,
    required: true,
    unique: true
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


export const JobModel = model<IJob>('Job', JobSchema)