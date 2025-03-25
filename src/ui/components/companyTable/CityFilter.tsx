import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

interface CityFilterProps {
	cities: string[]
	value: string
	onChange: (value: string) => void
	disabled: boolean
}

export const CityFilter: React.FC<CityFilterProps> = ({
	cities,
	value,
	onChange,
	disabled,
}) => (
	<Select value={value} onValueChange={onChange} disabled={disabled}>
		<SelectTrigger className="w-[180px]">
			<SelectValue placeholder="Filter by Value" />
		</SelectTrigger>
		<SelectContent>
			{cities.map((city) => (
				<SelectItem key={city} value={city}>
					{city}
				</SelectItem>
			))}
		</SelectContent>
	</Select>
)
