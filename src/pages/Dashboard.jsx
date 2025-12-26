import { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Dashboard yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">📊 Yükleniyor...</div>;
  if (!stats) return <div className="error">Veriler yüklenemedi</div>;

  return (
    <div className="dashboard">
      <h2>📊 Genel Bakış</h2>
      
      <div className="stats-grid">
        <div className="stat-card products">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.products}</h3>
            <p>Toplam Ürün</p>
          </div>
        </div>

        <div className="stat-card customers">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.customers}</h3>
            <p>Müşteri</p>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>{stats.orders}</h3>
            <p>Toplam Sipariş</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{stats.revenue.toLocaleString('tr-TR')}₺</h3>
            <p>Toplam Ciro</p>
          </div>
        </div>
      </div>

      <div className="alerts">
        <div className="alert warning">
          <h3>⚠️ Bekleyen Siparişler</h3>
          <p>{stats.pendingOrders} sipariş ödeme bekliyor</p>
        </div>

        {stats.lowStockProducts.length > 0 && (
          <div className="alert danger">
            <h3>🔴 Düşük Stok Uyarısı</h3>
            <ul>
              {stats.lowStockProducts.map(product => (
                <li key={product.Product_ID}>
                  <strong>{product.Name}</strong>: {product.Current_Quantity} adet kaldı
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
