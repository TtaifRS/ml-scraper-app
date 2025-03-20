import { useState } from 'react'
import { jobCategories } from '../../data/jobCategories'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
// import { ChevronDown } from 'lucide-react'
import { FixedSizeList as List } from 'react-window'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface JobTitleSelectorProps {
	isDisabled: boolean
	startScraping: () => void
}

const allJobTitles: string[] = Object.values(jobCategories).flat()

const JobTitleSelector: React.FC<JobTitleSelectorProps> = ({
	isDisabled,
	startScraping,
}) => {
	const [selectedTitles, setSelectedTitles] = useState<Set<string>>(new Set())

	const isAllSelected: boolean = selectedTitles.size === allJobTitles.length
	const isSomeSelected: boolean = selectedTitles.size > 0 && !isAllSelected

	const handleGlobalSelectAll = (checked: boolean): void => {
		setSelectedTitles(checked ? new Set(allJobTitles) : new Set())
	}

	const handleCategorySelectAll = (
		titles: string[],
		checked: boolean
	): void => {
		setSelectedTitles((prev) => {
			const newSelected = new Set(prev)
			titles.forEach((title) =>
				checked ? newSelected.add(title) : newSelected.delete(title)
			)
			return newSelected
		})
	}

	const handleJobSelect = (title: string): void => {
		setSelectedTitles((prev) => {
			const newSelected = new Set(prev)
			if (newSelected.has(title)) {
				newSelected.delete(title)
			} else {
				newSelected.add(title)
			}
			return newSelected
		})
	}

	const handleSubmit = async (): Promise<void> => {
		if (selectedTitles.size === 0) {
			alert('Please select at least one job title.')
			return
		}

		try {
			const selectedArray = Array.from(selectedTitles)
			startScraping()
			window.electronAPI.sendMultipleSearch(selectedArray)
			setSelectedTitles(new Set())
		} catch (error) {
			console.error('Submission failed', error)
		}
	}

	return (
		<div className="w-full mx-auto p-4">
			<div className="flex flex-col gap-4">
				<div className="flex flex-row justify-between items-center">
					<h2 className="font-black text-lg">Select Job Titles</h2>
					{isDisabled ? (
						<Button
							disabled={isDisabled}
							className=" cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
						>
							<Loader2 className="animate-spin" />
							Please wait
						</Button>
					) : (
						<Button
							onClick={handleSubmit}
							className=" cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
						>
							Scrape Multiple Jobs
						</Button>
					)}
				</div>

				<div className="flex items-center mb-4">
					<Checkbox
						checked={isAllSelected}
						onCheckedChange={(checked: boolean) =>
							handleGlobalSelectAll(checked)
						}
						aria-checked={
							isSomeSelected ? 'mixed' : isAllSelected ? 'true' : 'false'
						}
						className="data-[state=checked]:bg-slate-900"
					/>
					<span className="ml-2 font-bold">Select All Jobs</span>
				</div>
			</div>

			<Accordion
				type="multiple"
				className="flex flex-row flex-wrap gap-4  p-4 justify-between"
			>
				{Object.entries(jobCategories).map(([category, titles]) => {
					const isCategoryAllSelected: boolean = titles.every((title) =>
						selectedTitles.has(title)
					)
					const isCategorySomeSelected: boolean = titles.some((title) =>
						selectedTitles.has(title)
					)
					return (
						<AccordionItem
							key={category}
							value={category}
							className="md:w-1/3 border-0 sm:w-full"
						>
							<div className="flex flex-row gap-2 items-center">
								<div onClick={(e) => e.stopPropagation()}>
									<Checkbox
										checked={isCategoryAllSelected}
										onCheckedChange={(checked: boolean) =>
											handleCategorySelectAll(titles, checked)
										}
										aria-checked={
											isCategorySomeSelected
												? 'mixed'
												: isCategoryAllSelected
												? 'true'
												: 'false'
										}
										className="data-[state=checked]:bg-slate-700"
									/>
								</div>
								<AccordionTrigger className="flex gap-0.5 font-bold text-base">
									{category}
								</AccordionTrigger>
							</div>

							<AccordionContent className="">
								<List
									height={300}
									itemCount={titles.length}
									itemSize={48}
									width="100%"
									className="list-scrollbar"
								>
									{({ index, style }) => {
										const title = titles[index]
										return (
											<>
												<div
													style={style}
													className="flex flex-col gap-2 pl-2 h-[10px]"
												>
													<div className="flex items-center gap-2">
														<Checkbox
															checked={selectedTitles.has(title)}
															onCheckedChange={() => handleJobSelect(title)}
															className=" data-[state=checked]:bg-slate-500"
														/>
														<span className="text-sm">{title}</span>
													</div>
													<Separator />
												</div>
											</>
										)
									}}
								</List>
							</AccordionContent>
							<Separator className="bg-gray-800" />
						</AccordionItem>
					)
				})}
			</Accordion>
		</div>
	)
}

export default JobTitleSelector
