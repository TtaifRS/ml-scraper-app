import CreateCsv from './CreateCsv'
import ScrapeCompanies from './ScrapeCompanies'
import ScrapeJobs from './ScrapeJobs'
import SearchJobs from './SearchJobs'

const SearchComponent = () => {
	return (
		<div className="flex flex-col gap-[16px] bg-stone-500 w-screen h-full items-start justify-center px-[120px] overflow-hidden">
			<SearchJobs />
			<ScrapeJobs />
			<ScrapeCompanies />
			<CreateCsv />
		</div>
	)
}

export default SearchComponent
