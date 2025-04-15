import { useState } from 'react'
import IndustrySelector from './IndustrySelector'

const ScrapeYellowPage = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const startScraping = () => {
		setIsLoading(false)
	}

	return (
		<div className="w-full">
			<IndustrySelector isDisabled={isLoading} startScraping={startScraping} />
		</div>
	)
}

export default ScrapeYellowPage
