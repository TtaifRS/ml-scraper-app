import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEffect, useRef } from 'react'

export interface ConsoleMessage {
	type: 'progress' | 'result' | 'error'
	message: string
}

interface ConsoleAreaProps {
	title: string
	consoleMessages: ConsoleMessage[]
	onClear: () => void
}

const ConsoleArea: React.FC<ConsoleAreaProps> = ({
	title,
	consoleMessages,
	onClear,
}) => {
	const viewportRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (viewportRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = viewportRef.current
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10

			if (isAtBottom) {
				viewportRef.current.scrollTop = viewportRef.current.scrollHeight
			}
		}
	}, [consoleMessages])

	return (
		<div className="bg-gray-900 w-full rounded-lg shadow-lg p-4 mt-4">
			<div className="flex justify-between items-center mb-2">
				<p className="text-blue-300 font-mono text-sm">{title}</p>
				{consoleMessages.length > 0 && (
					<Button
						className="text-gray-400 hover:text-white text-sm font-mono"
						onClick={onClear}
					>
						Clear
					</Button>
				)}
			</div>
			{consoleMessages.length > 0 && (
				<ScrollArea className="h-[200px] w-full rounded-md border border-gray-700">
					<div ref={viewportRef} className="p-4 font-mono text-sm">
						{consoleMessages.map((msg, index) => (
							<p
								key={index}
								className={`my-0 ${
									msg.type === 'progress'
										? 'text-gray-300'
										: msg.type === 'result'
										? 'text-green-400'
										: 'text-red-400'
								} `}
							>
								{msg.message}
							</p>
						))}
					</div>
				</ScrollArea>
			)}
		</div>
	)
}

export default ConsoleArea
