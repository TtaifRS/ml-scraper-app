import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import XingScraper from './screen/XingScraperScreen'

import XingTable from './screen/XingTableScreen'
import Sidebar from './components/sidebar/Sidebar'

function App() {
	return (
		<Router>
			<div className="flex">
				<Sidebar />
				<Routes>
					<Route path="/" element={<XingScraper />} />
					<Route path="/xing-table" element={<XingTable />} />
				</Routes>
			</div>
		</Router>
	)
}
export default App
