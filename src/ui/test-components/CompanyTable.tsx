/* eslint-disable react-hooks/exhaustive-deps */
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ICompany } from '@/ui/types/company'

import { useEffect, useState } from 'react'

const All_CITIES_OPTION = {
	value: 'All Cities',
	label: 'All Cities',
}

const CompanyTester: React.FC = () => {
	const [search, setSearch] = useState<string>('')
	const [city, setCity] = useState<string>(All_CITIES_OPTION.value)
	const [cities, setCities] = useState<string[]>([])
	const [companies, setCompanies] = useState<ICompany[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	const fetchData = async () => {
		try {
			setIsLoading(true)
			setError(null)

			const companiesData = await window.electronAPI.getCompanies({
				page: 1,
				limit: 1000,
				city: city !== All_CITIES_OPTION.value ? city : undefined,
				search: search.length ? search : undefined,
				sortBy: 'name',
				sortOrder: 'asc',
			})

			setCompanies(companiesData.companies)

			if (cities.length === 0) {
				const citiesData = await window.electronAPI.getCities()
				const cities = [...citiesData, All_CITIES_OPTION.value]
				setCities(cities)
			}
		} catch (error) {
			console.log('API ERROR', error)
			setError(error instanceof Error ? error.message : 'An error occured')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			fetchData()
		}, 500)

		return () => clearTimeout(debounceTimer)
	}, [search, city])

	useEffect(() => {
		fetchData()
	}, [])

	return (
		<div className="h-full w-full">
			<h1>Company Table</h1>
			<div className="flex gap-4 items-center">
				<Input
					placeholder="search term"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="mx-w-sm"
					disabled={isLoading}
				/>

				{isLoading ? (
					<span>Loading...</span>
				) : (
					<Select value={city} onValueChange={setCity} disabled={isLoading}>
						<SelectTrigger>
							<SelectValue placeholder="Select City" />
						</SelectTrigger>
						<SelectContent>
							{cities.map((cityOption) => (
								<SelectItem key={cityOption} value={cityOption}>
									{cityOption}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>
			{error && <div>Error: {error}</div>}

			<div className="mt-4">
				<h3>Companies</h3>
				{companies.length > 0 ? (
					<ul>
						{companies.map((company) => (
							<li key={company._id}>
								<div>Name: {company.name}</div>
								<hr />
								<div>URL: {company.profileUrl}</div>
								<hr />
								<div>Service: {company.service}</div>
								<hr />
								{company.city && <div>City: {company.city}</div>}
								<hr />
								{company.xingFollowers && <div>{company.xingFollowers}</div>}
								<br />
							</li>
						))}
					</ul>
				) : (
					<div>No companies found</div>
				)}
			</div>
		</div>
	)
}

export default CompanyTester
