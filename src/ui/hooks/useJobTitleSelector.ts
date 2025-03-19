import { useState, useMemo } from 'react';
import {  JobCategoryData } from '../types/types';

export const useJobTitleSelctor = (jobCategories: JobCategoryData) => {
  const [selectedTitles, setSetselectedTitles] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const flattendData = useMemo(() => 
    Object.entries(jobCategories).flatMap(([category, titles]) => [
      {type: 'category', name: category} as const,
      ...titles.map(title => ({
        type: 'job',
        title,
        category
      } as const))
    ]), [jobCategories])

    const filteredData = useMemo(() => {
      if(!searchTerm) return flattendData
      const lowerSearch = searchTerm.toLowerCase()
      return flattendData.filter(item => 
        item.type === 'category' ||
        item.title.toLowerCase().includes(lowerSearch)
      )
    }, [flattendData, searchTerm])

    const handleCheckboxChange = (title: string) => {
      setSetselectedTitles(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title])
    }

    return{
      selectedTitles,
      searchTerm,
      isLoading,
      filteredData,
      setIsLoading,
      setSearchTerm,
      handleCheckboxChange
    }
}