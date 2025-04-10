import { HashRouter as Router, Routes, Route } from 'react-router-dom'

import Sidebar from './components/sidebar/Sidebar'

import XingScraper from './screen/XingScraperScreen'
import XingTable from './screen/XingTableScreen'

import YellowPageScraper from './screen/YellowPageScreen'

function App() {
	return (
		<Router>
			<div className="flex">
				<Sidebar />
				<Routes>
					<Route path="/" element={<XingScraper />} />
					<Route path="/xing-table" element={<XingTable />} />
					<Route path="/yellow-page" element={<YellowPageScraper />} />
				</Routes>
			</div>
		</Router>
	)
}
export default App
