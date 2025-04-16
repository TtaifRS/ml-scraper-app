import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'

import industriesData from '../../data/industries.json'
import { Separator } from '@/components/ui/separator'
interface IndustrySelectorProps {
	isDisabled: boolean
	startScraping: () => void
}

interface Industry {
	industry: string
	link: string
}

interface SubCategory {
	subCategory: string
	subCategoryLink: string
	industries: Industry[]
}
interface Category {
	category: string
	categoryLink: string
	subCategories: SubCategory[]
}

const IndustrySelector: React.FC<IndustrySelectorProps> = ({
	isDisabled,
	startScraping,
}) => {
	const [selectedIndustries, setSelectedIndustries] = useState<Set<string>>(
		new Set()
	)
	const industries: Category[] = industriesData

	const createIndustryKey = (
		category: string,
		subCategory: string,
		industry: string
	) => {
		return `${category}|${subCategory}|${industry}`
	}

	const allIndustryKey = useMemo(() => {
		const keys = industries.flatMap((category) =>
			category.subCategories.flatMap((subCategory) =>
				subCategory.industries.map((industry) =>
					createIndustryKey(
						category.category,
						subCategory.subCategory,
						industry.industry
					)
				)
			)
		)
		return new Set(keys)
	}, [industries])

	const isAllSeleted = selectedIndustries.size === allIndustryKey.size
	const isSomeSelected = selectedIndustries.size > 0 && !isAllSeleted

	const handleGlobalSelectAll = (checked: boolean) => {
		setSelectedIndustries(checked ? new Set(allIndustryKey) : new Set())
	}

	const handleCategorySelect = (category: Category, checked: boolean) => {
		const categoryKeys = category.subCategories.flatMap((subCategory) =>
			subCategory.industries.map((industry) =>
				createIndustryKey(
					category.category,
					subCategory.subCategory,
					industry.industry
				)
			)
		)

		setSelectedIndustries((prev) => {
			const next = new Set(prev)
			categoryKeys.forEach((key) =>
				checked ? next.add(key) : next.delete(key)
			)
			return next
		})
	}

	const handleSubCategorySelect = (
		subCategory: SubCategory,
		category: Category,
		checked: boolean
	) => {
		const subCategoryKeys = subCategory.industries.map((industry) =>
			createIndustryKey(
				category.category,
				subCategory.subCategory,
				industry.industry
			)
		)
		setSelectedIndustries((prev) => {
			const next = new Set(prev)
			subCategoryKeys.forEach((key) =>
				checked ? next.add(key) : next.delete(key)
			)
			return next
		})
	}

	const handleIndustrySelect = (
		category: string,
		subcategory: string,
		industryTitle: string
	) => {
		const key = createIndustryKey(category, subcategory, industryTitle)

		setSelectedIndustries((prev) => {
			const next = new Set(prev)
			if (next.has(key)) {
				next.delete(key)
			} else {
				next.add(key)
			}
			return next
		})
	}

	const handleSubmit = async () => {
		if (selectedIndustries.size === 0) {
			alert('Please select at least on industry to scrape')
		}
		const payload = Array.from(selectedIndustries).map((key) => {
			const [category, subCategory, industryTitle] = key.split('|')
			return {
				industryName: industryTitle,
				cityName: '',
				category,
				subCategory,
			}
		})

		try {
			startScraping()
			window.electronAPI.scrapeYellowPage(payload)
			setSelectedIndustries(new Set())
		} catch (error) {
			console.error('Submission failed', error)
		}

		return
	}

	return (
		<div className="w-full mx-auto p-4 overflow-x-hidden">
			<div className="flex flex-col gap-4">
				<div className="flex flex-row justify-between items-start mb-2">
					<div className="flex flex-col gap-2">
						<h2 className="font-black text-lg">
							Select Yellow Page Industries
						</h2>
						<p className="font-medium text-sm">
							You can select by category, subcategory or industry
						</p>
					</div>
					{isDisabled ? (
						<Button
							disabled={isDisabled}
							className="cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
						>
							<Loader2 className="animate-spin">Please Wait</Loader2>
						</Button>
					) : (
						<Button
							onClick={handleSubmit}
							className="cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
						>
							Scrape Multiple Industries
						</Button>
					)}
				</div>

				<div className="flex items-center mb-4">
					<Checkbox
						checked={isAllSeleted}
						onCheckedChange={(checked: boolean) =>
							handleGlobalSelectAll(checked)
						}
						aria-checked={
							isSomeSelected ? 'mixed' : isAllSeleted ? 'true' : 'false'
						}
						className="data-[state=checked]:bg-slate-900"
					/>
					<span className="ml-2 font-bold">Select All</span>
				</div>
			</div>

			<Accordion
				type="multiple"
				className="flex flex-row flex-wrap gap-4 p-4 justify-between"
			>
				{industries.map((category) => {
					const isCategoryAllSelected = category.subCategories.every(
						(subCategory) =>
							subCategory.industries.every((industry) =>
								selectedIndustries.has(
									createIndustryKey(
										category.category,
										subCategory.subCategory,
										industry.industry
									)
								)
							)
					)
					const isCategorySomeSelected = category.subCategories.some(
						(subCategory) =>
							subCategory.industries.some((industry) =>
								selectedIndustries.has(
									createIndustryKey(
										category.category,
										subCategory.subCategory,
										industry.industry
									)
								)
							)
					)
					return (
						<AccordionItem
							key={category.category}
							value={category.category}
							className="md:w-1/3 border-0 sm:w-full"
						>
							<div className="flex items-center">
								<Checkbox
									checked={isCategoryAllSelected}
									onCheckedChange={(checked: boolean) =>
										handleCategorySelect(category, checked)
									}
									aria-checked={
										isCategorySomeSelected
											? 'mixed'
											: isAllSeleted
											? 'true'
											: 'false'
									}
									className="data-[state=checked]:bg-slate-900"
								/>
								<AccordionTrigger className="font-bold text-base pl-2">
									{category.category}
								</AccordionTrigger>
							</div>
							<AccordionContent>
								{category.subCategories.map((subCategory) => {
									const isSubAll = subCategory.industries.every((industry) =>
										selectedIndustries.has(
											createIndustryKey(
												category.category,
												subCategory.subCategory,
												industry.industry
											)
										)
									)

									const isSubSome = subCategory.industries.some((industry) =>
										selectedIndustries.has(
											createIndustryKey(
												category.category,
												subCategory.subCategory,
												industry.industry
											)
										)
									)
									return (
										<div key={subCategory.subCategory} className="mb-4">
											<div className="flex items-center pl-4">
												<Checkbox
													checked={isSubAll}
													onCheckedChange={(checked: boolean) =>
														handleSubCategorySelect(
															subCategory,
															category,
															checked
														)
													}
													aria-checked={
														isSubSome
															? 'mixed'
															: isAllSeleted
															? 'true'
															: 'false'
													}
													className="data-[state=checked]:bg-slate-900"
												/>
												<span className="ml-2 font-medium">
													{subCategory.subCategory}
												</span>
											</div>
											<List
												height={200}
												itemCount={subCategory.industries.length}
												itemSize={48}
												width="100%"
												className="list-scrollbar"
											>
												{({ index, style }) => {
													const industry = subCategory.industries[index]
													const industryKey = createIndustryKey(
														category.category,
														subCategory.subCategory,
														industry.industry
													)
													return (
														<div
															style={style}
															className="flex items-center pl-8 pr-4"
														>
															<Checkbox
																checked={selectedIndustries.has(industryKey)}
																onCheckedChange={() =>
																	handleIndustrySelect(
																		category.category,
																		subCategory.subCategory,
																		industry.industry
																	)
																}
																className="data-[state=checked]:bg-slate-900"
															/>
															<span className="ml-2 text-sm">
																{industry.industry}
															</span>
														</div>
													)
												}}
											</List>
											<Separator className="my-2" />
										</div>
									)
								})}
							</AccordionContent>
						</AccordionItem>
					)
				})}
			</Accordion>
		</div>
	)
}

export default IndustrySelector
