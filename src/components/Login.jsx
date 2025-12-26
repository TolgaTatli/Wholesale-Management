import { useState, useEffect } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [userType, setUserType] = useState(null); // 'admin' or 'customer'
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch customers from database
  useEffect(() => {
    if (userType === 'customer') {
      setLoading(true);
      fetch('http://localhost:5000/api/customers')
        .then(res => res.json())
        .then(data => {
          setCustomers(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Müşteriler yüklenemedi:', err);
          setLoading(false);
          alert('Müşteriler yüklenemedi. Lütfen backend\'in çalıştığından emin olun.');
        });
    }
  }, [userType]);

  const handleAdminLogin = () => {
    onLogin({ type: 'admin' });
  };

  const handleCustomerLogin = () => {
    if (!selectedCustomer) {
      alert('Lütfen müşteri seçin!');
      return;
    }
    const customer = customers.find(c => c.Customer_ID === parseInt(selectedCustomer));
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
        
        {loading ? (
          <p className="loading">Müşteriler yükleniyor...</p>
        ) : (
          <select 
            className="customer-select"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">-- Müşteri Seçin --</option>
            {customers.map(customer => (
              <option key={customer.Customer_ID} value={customer.Customer_ID}>
                {customer.Name}
              </option>
            ))}
          </select>
        )}
        
        <button className="submit-btn" onClick={handleCustomerLogin} disabled={loading}>
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
