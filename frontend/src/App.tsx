import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import AgentsPage from './pages/AgentsPage'
import JobsPage from './pages/JobsPage'
import MarketplacePage from './pages/MarketplacePage'
import TransactionsPage from './pages/TransactionsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="transactions" element={<TransactionsPage />} />
      </Route>
    </Routes>
  )
}
