import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import CustomerDashboard from './components/CustomerDashboard'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import Payments from './pages/Payments'

function App() {
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('dashboard')
  }

  // Login ekranı
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // Customer Dashboard
  if (user.type === 'customer') {
    return <CustomerDashboard user={user} onLogout={handleLogout} />
  }

  // Admin Dashboard
  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard />
      case 'products': return <Products />
      case 'orders': return <Orders />
      case 'customers': return <Customers />
      case 'suppliers': return <Suppliers />
      case 'payments': return <Payments />
      default: return <Dashboard />
    }
  }

  return (
    <div className="app">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
      <button className="admin-logout" onClick={handleLogout}>
        🚪 Çıkış
      </button>
    </div>
  )
}

export default App
