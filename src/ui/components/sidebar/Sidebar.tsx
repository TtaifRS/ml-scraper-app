import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const Sidebar = () => {
	const [open, setOpen] = useState<boolean>(false)
	return (
		<>
			<Button
				onClick={() => setOpen(!open)}
				className={cn(
					'fixed z-50 p-2 transition-all duration-300 w-8 h-8 rounded-full',
					open ? 'left-48 ml-4' : 'left-4',
					'top-4 '
				)}
			>
				{open ? <X /> : <Menu />}
			</Button>

			<div
				className={cn(
					'fixed left-0 top-0 h-full bg-black shadow-lg w-64 transition-transform duration-300 ease-in-out border-r',
					open ? 'translate-x-0' : '-translate-x-full'
				)}
			>
				<nav className="flex flex-col p-4 mt-16 space-y-2">
					<Link
						to="/"
						className="px-4 py-2 rounded-lg text-white hover:bg-gray-900"
						onClick={() => setOpen(false)}
					>
						Dashboard
					</Link>
					<Link
						to="/xing-table"
						className="px-4 py-2 rounded-lg text-white hover:bg-gray-900"
						onClick={() => setOpen(false)}
					>
						Xing Table
					</Link>
				</nav>
			</div>
		</>
	)
}

export default Sidebar
