import { useEffect, useState } from 'react'

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
			<div className="flex w-full flex-row gap-[8px] items-center">
				<p className="w-full font-medium text-xl">Download CSV File</p>
				<button
					className="text-white w-full bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
					onClick={handleCsvDownload}
				>
					Download CSV
				</button>
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
