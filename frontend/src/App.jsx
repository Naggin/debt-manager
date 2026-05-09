import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ActionPlan from './components/ActionPlan'
import Simulator from './components/Simulator'

function App() {
  const [page, setPage] = useState('dashboard')
  const [debts, setDebts] = useState([
    { id: 1, creditor_name: 'Nubank', current_balance: 2500, original_amount: 2500, monthly_interest_rate: 0.0399, due_date: '2024-12-01', status: 'active' },
    { id: 2, creditor_name: 'PagBank', current_balance: 1800, original_amount: 1800, monthly_interest_rate: 0.0299, due_date: '2024-11-15', status: 'active' },
    { id: 3, creditor_name: 'Banco do Brasil', current_balance: 5000, original_amount: 5200, monthly_interest_rate: 0.0199, due_date: '2025-01-01', status: 'active' },
    { id: 4, creditor_name: 'Itaú', current_balance: 800, original_amount: 1000, monthly_interest_rate: 0.0249, due_date: '2024-10-15', status: 'active' }
  ])

  return (
    <>
      {page === 'dashboard' && (
        <Dashboard
          debts={debts}
          setDebts={setDebts}
          onGoToActionPlan={() => setPage('actionplan')}
          onGoToSimulator={() => setPage('simulator')}
        />
      )}
      {page === 'actionplan' && (
        <ActionPlan
          debts={debts}
          monthlyPayment={1000}
          onBack={() => setPage('dashboard')}
        />
      )}
      {page === 'simulator' && (
        <Simulator
          debts={debts}
          onBack={() => setPage('dashboard')}
        />
      )}
    </>
  )
}

export default App
