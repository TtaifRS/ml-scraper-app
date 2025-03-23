import { useEffect, useState } from 'react'

const UpdateProgres: React.FC = () => {
	const [isDownloading, setIsDownloading] = useState<boolean>(false)
	const [progress, setProgress] = useState<number>(0)

	useEffect(() => {
		const {
			onUpdateDownloadStart,
			onUpdateDownloadProgress,
			onUpdateDownloadComplete,
		} = window.electronAPI

		const remeoveStartListner = onUpdateDownloadStart(() => {
			setIsDownloading(true)
			setProgress(0)
		})

		const removeProgressListner = onUpdateDownloadProgress((progressObj) => {
			setProgress(progressObj.percent)
		})

		const removeCompleteListner = onUpdateDownloadComplete(() => {
			setIsDownloading(false)
		})

		return () => {
			remeoveStartListner()
			removeProgressListner()
			removeCompleteListner()
		}
	}, [])

	if (!isDownloading) return null

	return (
		<div className="fixed bottom-5 right-5 bg-amber-50 p-2.5 border-2 border-b-blue-200 rounded-b-sm shadow-md z-50">
			<p className="ml-1.5">Downloading Update: {progress.toFixed(2)}%</p>
			<progress value={progress} max={100} className="w-[200px]" />
		</div>
	)
}

export default UpdateProgres
