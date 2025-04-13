import {useState, useEffect} from 'react'
type Service = Record<'value' | 'label', string>
export const useServices = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try{
        const datas: string[] = await window.electronAPI.getServices()
        console.log(datas)
        const tempData: Service[] = []    
        datas.map((data) => {
          tempData.push({label: data, value: data})
        })
        setServices(tempData)
      }catch(err){
        setError(err instanceof Error ? err.message : 'Failed to fetch services')
      }finally{
        setLoading(false)
      }
    }
    fetchServices()
  },[])
  return {services, loading, error}
}