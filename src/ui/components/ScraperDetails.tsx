import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ConsoleArea, { ConsoleMessage } from './ConsoleArea'

interface ScraperProps {
	title: string
	buttonLabel: string
	consoleTitle: string
	onResult: (callback: (result: string) => void) => () => void
	onProgress: (callback: (message: string) => void) => () => void
	onError: (callback: (error: string) => void) => () => void
	onScrape: () => void
}

const ScraperDetails: React.FC<ScraperProps> = ({
	title,
	buttonLabel,
	consoleTitle,
	onResult,
	onProgress,
	onError,
	onScrape,
}) => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [consoleMessage, setConsoleMessage] = useState<ConsoleMessage[]>([])

	useEffect(() => {
		const unubscribeResult = onResult((result: string) => {
			setConsoleMessage((prev) => [
				...prev,
				{ type: 'result', message: result },
			])
			setIsLoading(false)
		})

		const unsubscribeProgress = onProgress((message: string) => {
			setConsoleMessage((prev) => [...prev, { type: 'progress', message }])
		})

		const unsubscribeError = onError((errorMessage: string) => {
			setConsoleMessage((prev) => [
				...prev,
				{ type: 'error', message: errorMessage },
			])
			setIsLoading(false)
		})

		return () => {
			unubscribeResult()
			unsubscribeProgress()
			unsubscribeError()
		}
	}, [onResult, onError, onProgress])

	const handleScrape = () => {
		setIsLoading(true)
		setConsoleMessage([])
		onScrape()
	}

	return (
		<div className="w-full flex flex-col gap-2 p-4 overflow-x-hidden">
			<div className="flex justify-between">
				<p className="font-bold text-xl">{title}</p>
				{isLoading ? (
					<Button
						onClick={handleScrape}
						className="cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
						disabled={isLoading}
					>
						<Loader2 className="animate-spin" />
						Please wait
					</Button>
				) : (
					<Button
						onClick={handleScrape}
						className="cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
					>
						{buttonLabel}
					</Button>
				)}
			</div>
			<ConsoleArea
				title={consoleTitle}
				consoleMessages={consoleMessage}
				onClear={() => setConsoleMessage([])}
			/>
		</div>
	)
}

export default ScraperDetails
