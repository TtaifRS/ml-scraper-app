import { FilterQuery, SortOrder } from 'mongoose'
import Company, { ICompany} from '../../../models/company.model.js'

export interface GetCompaniesParam {
  page: number,
  limit: number,
  city?: string,
  search?: string,
  sortBy: keyof ICompany,
  sortOrder: 'asc' | 'desc'
}

interface PaginatedCompaniesResult{
  companies: ICompany[],
  totalPages: number,
  currentPage: number
}

export const getCompanies = async (_event: Electron.IpcMainInvokeEvent, queryParams: GetCompaniesParam) : Promise<PaginatedCompaniesResult> => {
 try{
  const {page, limit, city, search, sortBy, sortOrder} = queryParams

  const query: FilterQuery<ICompany> = {}

  if(city) query.city = city
  if(search) {
    query.name = {
      $regex: search,
      $options: 'i' as const
    }
  }

  const sortOptions: { [key in keyof ICompany]?: SortOrder } = {
    [sortBy]: sortOrder === 'asc' ? 1 : '-1'
  }

  const companies = await Company.find(query)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  const total = await Company.countDocuments(query)

  
  return {
    companies,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  }
 }catch(error){
  console.error('Error in get companies', error)

  return {
    companies: [],
    totalPages: 0,
    currentPage: queryParams.page
  }
 }
}

export const getCities = async() : Promise<string[]> => {
  try{
    const cities = await Company.distinct('city')
    return cities.filter((city): city is string => !!city)
  }catch(error){
    console.error(error)
    return []
  }
}