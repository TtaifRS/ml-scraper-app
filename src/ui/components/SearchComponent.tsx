import CreateCsv from './CreateCsv'
import ScraperDetails from './ScraperDetails'
import JobLinkScraper from './jobSearch/JobLinkScraper'

const SearchComponent = () => {
	return (
		<div className="flex flex-col gap-[16px] bg-black w-screen h-full items-start justify-center px-[120px] overflow-hidden py-10">
			<JobLinkScraper />
			<ScraperDetails
				title="Scrape All Job Details"
				buttonLabel="Scrape Job Details"
				consoleTitle="ML-Xing-App (Job Details Scrape Console)"
				onResult={(callback) => window.electronAPI.onScrapeJobResult(callback)}
				onProgress={(callback) =>
					window.electronAPI.onScrapeJobProgress(callback)
				}
				onError={(callback) => window.electronAPI.onScrapeJobError(callback)}
				onScrape={() => window.electronAPI.scrapeJobs()}
			/>

			<ScraperDetails
				title="Scrape All Company Details"
				buttonLabel="Scrape Company Details"
				consoleTitle="ML-Xing-App (Company Details Scraper Console)"
				onResult={(callback) =>
					window.electronAPI.onScrapeCompanyResult(callback)
				}
				onProgress={(callback) =>
					window.electronAPI.onScrapeCompanyProgress(callback)
				}
				onError={(callback) =>
					window.electronAPI.onScrapeCompanyError(callback)
				}
				onScrape={() => window.electronAPI.scrapeCompanies()}
			/>
			<CreateCsv />
		</div>
	)
}

export default SearchComponent
