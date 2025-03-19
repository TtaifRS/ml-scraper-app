import CreateCsv from './CreateCsv'
import ScrapeCompanies from './ScrapeCompanies'
import ScrapeJobs from './ScrapeJobs'
// import SearchJobs from './SearchJobs'

// import { jobCategories } from '../data/jobCategories'
// import JobTitleSelector from './JobTitleSelector'
import JobLinkScraper from './JobLinkScraper'

const SearchComponent = () => {
	return (
		<div className="flex flex-col gap-[16px] bg-black w-screen h-full items-start justify-center px-[120px] overflow-hidden py-10">
			<JobLinkScraper />
			<ScrapeJobs />
			<ScrapeCompanies />
			<CreateCsv />
		</div>
	)
}

export default SearchComponent
