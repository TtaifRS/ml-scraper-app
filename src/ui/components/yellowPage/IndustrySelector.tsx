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

	const uniqueIndustriesCount = useMemo(() => {
		const allLinks = industries.flatMap((category) =>
			category.subCategories.flatMap((sub) =>
				sub.industries.map((i) => i.industry)
			)
		)
		return new Set(allLinks).size
	}, [industries])

	const allIndustriesTitle = industries.flatMap((category) =>
		category.subCategories.flatMap((sub) =>
			sub.industries.map((i) => i.industry)
		)
	)

	console.log(allIndustriesTitle.length)
	console.log('selected Industry', selectedIndustries.size)

	const isAllSeleted = selectedIndustries.size === uniqueIndustriesCount
	const isSomeSelected = selectedIndustries.size > 0 && !isAllSeleted

	const handleGlobalSelectAll = (checked: boolean) => {
		setSelectedIndustries(checked ? new Set(allIndustriesTitle) : new Set())
	}

	const handleCategorySelect = (category: Category, checked: boolean) => {
		const categoryTitles = category.subCategories.flatMap((sub) =>
			sub.industries.map((i) => i.industry)
		)
		setSelectedIndustries((prev) => {
			const next = new Set(prev)
			categoryTitles.forEach((title) =>
				checked ? next.add(title) : next.delete(title)
			)
			return next
		})
	}

	const handleSubCategorySelect = (
		subCategory: SubCategory,
		checked: boolean
	) => {
		const subTitles = subCategory.industries.map((i) => i.industry)
		setSelectedIndustries((prev) => {
			const next = new Set(prev)
			subTitles.forEach((title) =>
				checked ? next.add(title) : next.delete(title)
			)
			return next
		})
	}

	const handleIndustrySelect = (industryTitle: string) => {
		setSelectedIndustries((prev) => {
			const next = new Set(prev)
			if (next.has(industryTitle)) {
				next.delete(industryTitle)
			} else {
				next.add(industryTitle)
			}
			return next
		})
	}

	const handleSubmit = async () => {
		if (selectedIndustries.size === 0) {
			alert('Please select at least on industry to scrape')
			await startScraping()
			return
		}
	}

	return (
		<div className="w-full mx-auto p-4 overflow-x-hidden">
			<div className="flex flex-col gap-4">
				<div className="flex flex-row justify-between items-center">
					<h2 className="font-black text-lg">Select Industries</h2>
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
					const categoryTitle = category.subCategories.flatMap((sub) =>
						sub.industries.map((i) => i.industry)
					)
					const isCategroyAllSelected = categoryTitle.every((title) =>
						selectedIndustries.has(title)
					)
					const isSomeCategorySelected = categoryTitle.some((title) =>
						selectedIndustries.has(title)
					)
					return (
						<AccordionItem
							key={category.category}
							value={category.category}
							className="md:w-1/3 border-0 sm:w-full"
						>
							<div className="flex items-center">
								<Checkbox
									checked={isCategroyAllSelected}
									onCheckedChange={(checked: boolean) =>
										handleCategorySelect(category, checked)
									}
									aria-checked={
										isSomeCategorySelected
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
									const subTitles = subCategory.industries.map(
										(i) => i.industry
									)
									const isSubAll = subTitles.every((title) =>
										selectedIndustries.has(title)
									)
									const isSubSome = subTitles.some((title) =>
										selectedIndustries.has(title)
									)
									return (
										<div key={subCategory.subCategory} className="mb-4">
											<div className="flex items-center pl-4">
												<Checkbox
													checked={isSubAll}
													onCheckedChange={(checked: boolean) =>
														handleSubCategorySelect(subCategory, checked)
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
													return (
														<div
															style={style}
															className="flex items-center pl-8 pr-4"
														>
															<Checkbox
																checked={selectedIndustries.has(
																	industry.industry
																)}
																onCheckedChange={() =>
																	handleIndustrySelect(industry.industry)
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
