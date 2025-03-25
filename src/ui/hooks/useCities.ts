import { useEffect, useState } from 'react'

export const ALL_CITIES_OPTION = "ALL CITIES"

export const useCities = () => {
  const [cities, setCities] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true)
      setError(null)
      try{
        const data: string[] = await window.electronAPI.getCities()
        const cities = [ ALL_CITIES_OPTION, ...data,]
        setCities(cities)
      }catch(err){
        setError(err instanceof Error ? err.message : 'Failed to fetch cities')
        console.error(err)
        setCities([])
      }finally{
        setIsLoading(false)
      }
    }

    fetchCities()
  }, [])

  return {cities, isLoading, error}
}