import CreateCsv from './createCsv'
import ScrapeCompanies from './ScrapeCompanies'
import ScrapeJobs from './ScrapeJobs'
import SearchJobs from './SearchJobs'

const SearchComponent = () => {
	return (
		<div className="flex flex-col gap-[16px] bg-stone-500 w-screen h-full items-start justify-center px-[120px]">
			<SearchJobs />
			<ScrapeJobs />
			<ScrapeCompanies />
			<CreateCsv />
		</div>
	)
}

export default SearchComponent
