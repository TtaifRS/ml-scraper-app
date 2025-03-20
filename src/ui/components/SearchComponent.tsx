import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import CreateCsv from './CreateCsv'
import ScraperDetails from './ScraperDetails'
import JobLinkScraper from './jobSearch/JobLinkScraper'

const SearchComponent = () => {
	return (
		<div className="flex flex-col gap-[16px] bg-black w-screen h-full items-start justify-center px-[120px] overflow-hidden py-10">
			<Card className="w-full bg-black text-white">
				<CardHeader>
					<CardTitle>Scrape Job Links from Xing</CardTitle>
					<CardDescription>
						To scrape single job search in input and to scrape multiple jobs use
						the checkboxes
					</CardDescription>
				</CardHeader>
				<CardContent>
					<JobLinkScraper />
				</CardContent>
			</Card>
			<Card className="w-full bg-black text-white">
				<CardHeader>
					<CardTitle>Scrape Job details</CardTitle>
					<CardContent>
						<ScraperDetails
							title="Scrape All Job details"
							buttonLabel="Scrape Job Details"
							consoleTitle="ML-Xing-App (Job Details Scrape Console)"
							onResult={(callback) =>
								window.electronAPI.onScrapeJobResult(callback)
							}
							onProgress={(callback) =>
								window.electronAPI.onScrapeJobProgress(callback)
							}
							onError={(callback) =>
								window.electronAPI.onScrapeJobError(callback)
							}
							onScrape={() => window.electronAPI.scrapeJobs()}
						/>
					</CardContent>
				</CardHeader>
			</Card>

			<Card className="w-full bg-black text-white">
				<CardHeader>
					<CardTitle>Scrape Company Details</CardTitle>
				</CardHeader>
				<CardContent>
					<ScraperDetails
						title="Scrape All Companies details"
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
				</CardContent>
			</Card>
			<Card className="w-full bg-black text-white">
				<CardHeader>
					<CardTitle>Generate CSV File</CardTitle>
				</CardHeader>
				<CardContent>
					<CreateCsv />
				</CardContent>
			</Card>
		</div>
	)
}

export default SearchComponent
