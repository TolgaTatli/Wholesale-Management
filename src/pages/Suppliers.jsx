import { useState, useEffect } from 'react';
import api from '../services/api';
import '../pages/Products.css';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await api.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Tedarikçiler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">🏭 Yükleniyor...</div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h2>🏭 Tedarikçi Yönetimi</h2>
      </div>

      <div className="products-grid">
        {suppliers.map(supplier => (
          <div key={supplier.Supplier_ID} className="product-card">
            <div className="product-header">
              <h3>{supplier.Name}</h3>
            </div>
            <div className="product-details">
              <p><strong>👤 İletişim:</strong> {supplier.Contact_Person}</p>
              <p><strong>📍 Adres:</strong> {supplier.Address}</p>
              <p><strong>💳 Ödeme:</strong> {supplier.Payment_Terms}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Suppliers;
