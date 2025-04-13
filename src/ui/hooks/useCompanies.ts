import { PaginatedCompaniesResult, CompanyQueryParams, ICompany } from './../types/company.d';
import { useEffect, useState } from 'react';
import { ALL_CITIES_OPTION } from './useCities';

interface UseCompaniesParam {
  pageIndex: number,
  pageSize: number,
  sortBy: Array<{id: string; desc: boolean}>,
  search: string,
  city: string,
  includeServices: string[],
  excludeServices: string[]
}

export const useCompanies = ({
  pageIndex,
  pageSize,
  sortBy,
  search,
  city,
  includeServices,
  excludeServices

}: UseCompaniesParam) => {

  const [companies, setCompanies] = useState<ICompany[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=> {
    const fetchCompanies = async() => {
      setIsLoading(true)
      setError(null)
      try{
        const sortField = sortBy[0]?.id as keyof ICompany || 'name'
        const sortOrder = sortBy[0]?.desc ? 'desc' : 'asc'

        const params: CompanyQueryParams = {
          page: pageIndex + 1,
          limit: pageSize,
          city: city && city !== ALL_CITIES_OPTION ? city : undefined,
          search: search || undefined,
          includeServices: includeServices ,
          excludeServices,
          sortBy: sortField,
          sortOrder
        }
        const data: PaginatedCompaniesResult = await window.electronAPI.getCompanies(params)
        setCompanies(data.companies)
        setTotalPages(data.totalPages)
      }catch(err){
        setError(err instanceof Error ? err.message : 'Failed to fetch companies')
        setCompanies([])
        setTotalPages(0)

      }finally{
        setIsLoading(false)
      }
    }
   
    fetchCompanies()
  },[pageIndex, pageSize, sortBy, search, city, includeServices, excludeServices])

  return {
    companies,
    totalPages,
    isLoading,
    error
  }
}