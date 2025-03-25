import { Schema, model, Document, Types } from 'mongoose';

export interface ICompany extends Document{
  profileUrl: string,
  name: string,
  slogan: string | null,
  service: string | null,
  xingFollowers: string | null,
  employees: string | null,
  ratings: string | null,
  employeeRecommendation: string | null,
  contactInfoName: string | null,
  contactInfoPosition: string | null,
  city: string | null,
  fullAddress: string | null,
  phoneNumber: string | null,
  email: string | null, 
  website: string | null,
  jobs: Types.ObjectId[] 
  createdAt: Date,
  updatedAt: Date
}

const companySchema = new Schema<ICompany>({
  profileUrl: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  slogan: {
    type: String,
    required: false
  },
  service: {
    type: String,
    required: false
  },
  xingFollowers: {
    type: String,
    required: false
  },
  employees: {
    type: String,
    required: false
  },
  ratings: {
    type: String,
    required: false
  },
  employeeRecommendation: {
    type: String,
    required: false
  },
  contactInfoName: {
    type: String,
    required: false
  },
  contactInfoPosition: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  fullAddress: {
    type: String,
    required: false
  },
  phoneNumber: {
    type: String,
    required: false,
    set: function(value: string) {
      if (typeof value === 'string' && value.startsWith("%")){
        return value.substring(1)
      }

      return value
    }
  },
  email: {
    type: String,
    required: false
  },
  website: {
    type: String,
    required: false
  },
  jobs: [{
    type: Schema.Types.ObjectId,
    ref: 'Job',
    default: []
  }]
}, { timestamps: true })

const Company = model<ICompany>('Company', companySchema)

export default Company