import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Command as CommandPrimitive } from 'cmdk'
import { Badge } from '@/components/ui/badge'
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command'

type Service = Record<'value' | 'label', string>

interface ServiceFilterProps {
	services: Service[]
	value: Service[]
	onChange: (selected: Service[]) => void
	disabled?: boolean
	placeHolder: string
}

export const ServiceFilter: React.FC<ServiceFilterProps> = ({
	services,
	value,
	onChange,
	disabled,
	placeHolder,
}) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const [open, setOpen] = useState(false)
	const [inputValue, setInputValue] = useState<string>('')

	useEffect(() => {
		setOpen(false)
	}, [value])

	const handleUnSelect = useCallback(
		(service: Service) => {
			onChange(value.filter((s) => s.value !== service.value))
		},
		[value, onChange]
	)

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const input = inputRef.current
			if (
				input &&
				(e.key === 'DELETE' || e.key === 'Backspace') &&
				input.value === ''
			) {
				onChange(value.slice(0, -1))
			}
			if (e.key === 'Escape') {
				input?.blur()
			}
		},
		[value, onChange]
	)

	const selectables = services.filter(
		(service) => !value.some((s) => s.value === service.value)
	)

	return (
		<Command
			onKeyDown={handleKeyDown}
			className="overflow-visible  bg-transparent text-white cursor-pointer"
		>
			<div className="group rounded-md border border-input px-3 py-2 text-sm ">
				<div className="flex flex-wrap gap-1">
					{value.map((service) => (
						<Badge key={service.value} variant="secondary">
							{service.label}
							<button
								className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleUnSelect(service)
								}}
								onMouseDown={(e) => {
									e.preventDefault()
									e.stopPropagation()
								}}
								onClick={() => handleUnSelect(service)}
							>
								<X className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer" />
							</button>
						</Badge>
					))}
					<CommandPrimitive.Input
						ref={inputRef}
						value={inputValue}
						onValueChange={setInputValue}
						onBlur={() => setOpen(false)}
						onFocus={() => setOpen(true)}
						placeholder={placeHolder}
						className="focus:outline-hidden"
						disabled={disabled}
					/>
				</div>
				<div className="relative mt-2">
					<CommandList>
						{open && selectables.length > 0 && (
							<div className="absolute top-0 z-10 w-full rounded-md border bg-black text-white shadow-md outline-none animate-in">
								<CommandGroup>
									{selectables.map((service) => (
										<CommandItem
											key={service.value}
											onMouseDown={(e) => {
												e.preventDefault()
												e.stopPropagation()
											}}
											onSelect={() => {
												setInputValue('')
												onChange([...value, service])
											}}
											className="text-white"
										>
											{service.label}
											<CommandSeparator />
										</CommandItem>
									))}
								</CommandGroup>
							</div>
						)}
					</CommandList>
				</div>
			</div>
		</Command>
	)
}
