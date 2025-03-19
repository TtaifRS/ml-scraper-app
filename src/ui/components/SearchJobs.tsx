import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

interface SearchJobsProps {
	isDisabled: boolean
	startScraping: () => void
}
const SearchJobs: React.FC<SearchJobsProps> = ({
	isDisabled,
	startScraping,
}) => {
	const [searchTerm, setSearchTerm] = useState<string>('')
	const handleSearch = () => {
		if (!searchTerm) return
		startScraping()
		window.electronAPI.sendSearch(searchTerm)
	}

	const handleCancel = () => {
		window.electronAPI.sendCancel()
	}

	return (
		<div className="w-full mx-auto p-4 ">
			<div className="flex w-full flex-row justify-between gap-20  items-end overflow-hidden">
				<Input
					value={searchTerm}
					placeholder="Search Job"
					className="focus-visible:ring-0"
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				{isDisabled ? (
					<div className="flex gap-2 items-center">
						<Button
							disabled={isDisabled}
							className="mt-4 cursor-pointer  text-white bg-gray-700 hover:bg-gray-900"
						>
							<Loader2 className="animate-spin" />
							Please wait
						</Button>
						<Button
							className="mt-4 cursor-pointer text-white"
							variant="destructive"
							onClick={handleCancel}
						>
							Cancel Search
						</Button>
					</div>
				) : (
					<Button
						onClick={handleSearch}
						className="mt-4 cursor-pointer  text-white bg-gray-700 hover:bg-gray-900"
					>
						Scrape Job by Search
					</Button>
				)}
			</div>
		</div>
	)
}

export default SearchJobs
