import { useState, useEffect } from 'react';
import api from '../services/api';
import '../pages/Products.css'; // Aynı stil yapısını kullan

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Müşteriler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">👥 Yükleniyor...</div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h2>👥 Müşteri Yönetimi</h2>
      </div>

      <div className="products-grid">
        {customers.map(customer => (
          <div key={customer.Customer_ID} className="product-card">
            <div className="product-header">
              <h3>{customer.Name}</h3>
            </div>
            <div className="product-details">
              <p><strong>📞 Telefon:</strong> {customer.Phone}</p>
              <p><strong>📧 Email:</strong> {customer.Email}</p>
              <p><strong>🆔 ID:</strong> #{customer.Customer_ID}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Customers;
