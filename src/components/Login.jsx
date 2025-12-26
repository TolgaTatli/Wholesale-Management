import { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [userType, setUserType] = useState(null); // 'admin' or 'customer'
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers] = useState([
    { id: 1, name: 'ABC Şirketi' },
    { id: 2, name: 'XYZ Ltd' },
    { id: 3, name: 'DEF Corporation' }
  ]);

  const handleAdminLogin = () => {
    onLogin({ type: 'admin' });
  };

  const handleCustomerLogin = () => {
    if (!selectedCustomer) {
      alert('Lütfen müşteri seçin!');
      return;
    }
    const customer = customers.find(c => c.id === parseInt(selectedCustomer));
    onLogin({ type: 'customer', customer });
  };

  if (!userType) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🏪 Toptan Yönetim Sistemi</h1>
          <p className="subtitle">Giriş Tipi Seçin</p>
          
          <div className="login-buttons">
            <button className="login-btn admin-btn" onClick={() => setUserType('admin')}>
              <span className="icon">👨‍💼</span>
              <span className="label">Admin Girişi</span>
              <span className="desc">Tam Yetki</span>
            </button>
            
            <button className="login-btn customer-btn" onClick={() => setUserType('customer')}>
              <span className="icon">👤</span>
              <span className="label">Müşteri Girişi</span>
              <span className="desc">Sipariş & Ödeme</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'admin') {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>👨‍💼 Admin Girişi</h2>
          <p className="info">Admin paneline hoş geldiniz</p>
          <button className="submit-btn" onClick={handleAdminLogin}>
            Giriş Yap
          </button>
          <button className="back-btn" onClick={() => setUserType(null)}>
            ← Geri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>👤 Müşteri Girişi</h2>
        <p className="info">Müşteri adınızı seçin</p>
        
        <select 
          className="customer-select"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">-- Müşteri Seçin --</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
        
        <button className="submit-btn" onClick={handleCustomerLogin}>
          Giriş Yap
        </button>
        <button className="back-btn" onClick={() => setUserType(null)}>
          ← Geri
        </button>
      </div>
    </div>
  );
}

export default Login;
