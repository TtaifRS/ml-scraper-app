import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const CreateCsv = () => {
	const [result, setResult] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		const { onDownloadSuccess, onDownloadError } = window.electronAPI

		const unsubscribeResults = onDownloadSuccess((result) => {
			setResult(result)
			setIsLoading(false)
		})

		const unsubscribeError = onDownloadError((errorMessage) => {
			setError(errorMessage)
			setIsLoading(false)
		})

		return () => {
			unsubscribeResults()
			unsubscribeError()
		}
	}, [])

	const handleCsvDownload = () => {
		setIsLoading(true)
		setError('')
		setResult('')

		window.electronAPI.downloadCsv()
	}

	return (
		<>
			<div className="flex w-full flex-row gap-[8px] items-center p-4 overflow-x-hidden">
				<p className="w-full font-medium text-xl">Download CSV File</p>
				<Button
					onClick={handleCsvDownload}
					className="cursor-pointer text-white bg-gray-700 hover:bg-gray-900"
				>
					Generate CSV
				</Button>
			</div>
			<div>
				{isLoading ? (
					<p className="text-yellow-300">Generating CSV. Please wait...</p>
				) : result.length ? (
					<p className="text-green-300">{result}</p>
				) : null}
			</div>
			{error && <p className="text-red-300">{error}</p>}
		</>
	)
}

export default CreateCsv
