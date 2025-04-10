import { Link } from 'react-router-dom'

interface SideBarlinkProps {
	title: string
	to: string
	onClick: () => void
}

const SidebarLink: React.FC<SideBarlinkProps> = ({ title, to, onClick }) => {
	return (
		<Link
			to={to}
			className="px-4 py-2 rounded-lg text-white hover:bg-gray-900"
			onClick={onClick}
		>
			{title}
		</Link>
	)
}

export default SidebarLink
