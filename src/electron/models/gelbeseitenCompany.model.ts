import { Schema, model, Document } from 'mongoose';


interface SocialMedia{
  platform: string, 
  platformLink: string
}

interface AdditionalInfo {
  infoTitle: string,
  info: string[]
}

export interface IGelbeseitenCompany extends Document {
  name: string,
  gelbeseitenLink: string,
  category: string,
  subCategory: string,
  industry: string,
  industryFull: string,
  logo?: string,
  city: string,
  rating?: string,
  reviewCount?: string,
  address: string,
  telephoneNumber?: string,
  fax?: string,
  email?: string,
  website?: string,
  socialMedia?: SocialMedia[],
  businessCard?: string,
  aboutUs?: string,
  companyAdditionalInfo?: AdditionalInfo[],
  brochureURL: string,
  createdAt: Date,
  updatedAt: Date
}

const SocialMediaSchema = new Schema<SocialMedia>({
  platform: {type: String, required: false},
  platformLink: {type: String, required: false}
})

const AdditionalInfoSchema = new Schema<AdditionalInfo>({
  infoTitle: {type: String, required: false},
  info: {type: [String], required: false}
})

const gelbeseitenCompanySchema = new Schema<IGelbeseitenCompany>({
  name: {
    type: String,
    required: true,
    index: true
  },
  gelbeseitenLink: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  industryFull: {type: String},
  logo: {type: String},
  city: {type: String, required: true},
  rating: {type: String},
  reviewCount: {type: String},
  address: {type: String, required: true},
  telephoneNumber: {type: String},
  fax: {type: String},
  email: {type: String, lowercase: true},
  socialMedia: {type: [SocialMediaSchema]},
  businessCard: {type: String},
  aboutUs: {type: String},
  companyAdditionalInfo: {type: [AdditionalInfoSchema]},
  brochureURL: {type: String},

}, {timestamps: true})

gelbeseitenCompanySchema.index({name: 'text', address: 'text', city: 1})
gelbeseitenCompanySchema.index({email: 1}, {unique: true, sparse: true})
gelbeseitenCompanySchema.index({webite: 1}, {unique: true, sparse: true})

gelbeseitenCompanySchema.virtual('formatedPhone').get(function(this: IGelbeseitenCompany){
  if(!this.telephoneNumber) return undefined
  return this.telephoneNumber.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3')
})


const GelbeseitenCompany = model<IGelbeseitenCompany>('GelbeseitenCompany', gelbeseitenCompanySchema)

export default GelbeseitenCompany