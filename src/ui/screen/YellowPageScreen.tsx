import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import ScrapeYellowPage from '../components/yellowPage/ScrapeYellowPage'
import GenerateYellowpagCSV from '../components/yellowPage/GenerateYellowpageCSV'

const YellowPageScraper = () => (
	<div className="flex flex-col gap-[16px] bg-black w-full min-w-screen items-start justify-center px-[120px] h-full min-h-screen py-10">
		<Card className="w-full bg-black text-white">
			<CardHeader>
				<CardTitle>Scrape Companies from Yellow page</CardTitle>
				<CardDescription>
					You can select one or multiple industries to scrape companies from
					yellow page
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrapeYellowPage />
			</CardContent>
		</Card>
		<Card className="w-full bg-black text-white">
			<CardHeader>
				<CardTitle>Download Yellow page company details as CSV</CardTitle>
			</CardHeader>
			<CardContent>
				<GenerateYellowpagCSV />
			</CardContent>
		</Card>
	</div>
)

export default YellowPageScraper
