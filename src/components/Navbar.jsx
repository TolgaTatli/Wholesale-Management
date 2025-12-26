import './Navbar.css';

function Navbar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: '📊 Ana Sayfa', icon: '📊' },
    { id: 'products', label: '📦 Ürünler', icon: '📦' },
    { id: 'orders', label: '🛒 Siparişler', icon: '🛒' },
    { id: 'customers', label: '👥 Müşteriler', icon: '👥' },
    { id: 'suppliers', label: '🏭 Tedarikçiler', icon: '🏭' },
    { id: 'payments', label: '💰 Ödemeler', icon: '💰' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>🏪 Toptan Yönetim</h1>
      </div>
      <ul className="navbar-menu">
        {menuItems.map(item => (
          <li key={item.id}>
            <button 
              className={currentPage === item.id ? 'active' : ''}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label.split(' ')[1]}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
