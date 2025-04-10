export interface ICompany {
  _id: string,
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
  jobs: string[],
  createdAt: string,
  updatedAt: string
}


export interface CompanyQueryParams {
  page: number,
  limit: number,
  city?: string | undefined,
  search?: string,
  sortBy: keyof ICompany,
  sortOrder: 'asc' | 'desc'
}

export interface PaginatedCompaniesResult{
  companies: ICompany[],
  totalPages: number,
  currentPage: number
}
