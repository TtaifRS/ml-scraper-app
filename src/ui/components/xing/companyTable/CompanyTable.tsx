import { useCities } from '@/ui/hooks/useCities'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type PaginationState,
	type SortingState,
} from '@tanstack/react-table'
import { ICompany } from '@/ui/types/company'
import { useCompanies } from '@/ui/hooks/useCompanies'
import { CityFilter } from './CityFilter'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react'

const columnHelper = createColumnHelper<ICompany>()

const CompanyTable = () => {
	const [searchValue, setSearchValue] = useState<string>('')
	const [debouncedSearch] = useDebounce(searchValue, 1000)
	const [selectedCity, setSelectedCity] = useState<string>('')
	const [sorting, setSorting] = useState<SortingState>([])
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 50,
	})

	const { cities = [] } = useCities()
	const { companies, isLoading, error, totalPages } = useCompanies({
		pageIndex: pagination.pageIndex,
		pageSize: pagination.pageSize,
		sortBy: sorting,
		search: debouncedSearch,
		city: selectedCity,
	})

	const columns = useMemo(
		() => [
			columnHelper.accessor('name', {
				header: 'Name',
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor('city', {
				header: 'City',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('fullAddress', {
				header: 'Full Address',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('phoneNumber', {
				header: 'Phone number',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('email', {
				header: 'Email',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('website', {
				header: 'Website',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('employees', {
				header: 'Employees',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('service', {
				header: 'Service',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('employeeRecommendation', {
				header: 'Employee Recomendation',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('ratings', {
				header: 'Ratings',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('contactInfoName', {
				header: 'Contact Name',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('contactInfoPosition', {
				header: 'Contact Position',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('jobs', {
				header: 'Total Jobs',
				cell: (info) => {
					const jobs = info.getValue() as string[]
					return jobs ? jobs.length : 0
				},
			}),
			columnHelper.accessor('slogan', {
				header: 'Slogan',
				cell: (info) => info.getValue() || '-',
			}),

			columnHelper.accessor('xingFollowers', {
				header: 'Xing Followers',
				cell: (info) => info.getValue() || '-',
			}),
			columnHelper.accessor('createdAt', {
				header: 'Created At',
				cell: (info) => new Date(info.getValue()).toLocaleString(),
			}),
			columnHelper.accessor('updatedAt', {
				header: 'Updated At',
				cell: (info) => new Date(info.getValue()).toLocaleString(),
			}),
		],
		[]
	)

	const table = useReactTable({
		data: companies || [],
		columns,
		pageCount: totalPages || -1,
		state: {
			sorting,
			pagination,
		},
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
		manualSorting: true,
	})

	useEffect(() => {
		table.setPageIndex(0)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch, selectedCity])

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-6">Xing Company</h1>
			<div className="flex flex-col sm:flex-row gap-4 mb-6 w-[1000px]">
				<Input
					placeholder="search term"
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					className="mx-w-sm"
					disabled={isLoading}
				/>
				<CityFilter
					cities={cities}
					value={selectedCity}
					onChange={setSelectedCity}
					disabled={isLoading || cities.length === 0}
				/>
			</div>

			{error && (
				<div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
					{error}
				</div>
			)}

			{isLoading && (
				<div className="flex justify-center p-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
				</div>
			)}

			{!isLoading && table.getRowModel().rows.length > 0 && (
				<>
					<div className="overflow-x-auto">
						<table className="min-w-full border-collapse" role="grid">
							<thead>
								{table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<th
												key={header.id}
												className="p-3 border-b bg-gray-600 cursor-pointer text-left text-sm font-semibold"
											>
												<div className="flex items-center">
													{flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
												</div>
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody>
								{table.getRowModel().rows.map((row) => (
									<tr key={row.id}>
										{row.getVisibleCells().map((cell) => (
											<td key={cell.id} className="p-3 border text-sm">
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="flex flex-col sm:flex-row items-center mt-6 gap-4 w-[1000px]">
						<div className="text-sm">
							Page {pagination.pageIndex + 1} of {table.getPageCount()}
						</div>
						<div className="flex gap-2">
							<Button
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
								variant="outline"
								className="text-white bg-transparent cursor-pointer"
							>
								<ChevronsLeft />
							</Button>
							<Button
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
								variant="outline"
								className="text-white bg-transparent cursor-pointer"
							>
								<ChevronLeft />
							</Button>
							<Button
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
								variant="outline"
								className="text-white bg-transparent cursor-pointer"
							>
								<ChevronRight />
							</Button>
							<Button
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
								variant="outline"
								className="text-white bg-transparent cursor-pointer"
							>
								<ChevronsRight />
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default CompanyTable
