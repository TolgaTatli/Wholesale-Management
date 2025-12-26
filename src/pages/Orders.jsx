import { useState, useEffect } from 'react';
import api from '../services/api';
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const data = await api.getOrder(orderId);
      setSelectedOrder(data);
    } catch (error) {
      alert('Sipariş detayları yüklenemedi: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) return <div className="loading">🛒 Yükleniyor...</div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>🛒 Sipariş Yönetimi</h2>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Sipariş No</th>
              <th>Müşteri</th>
              <th>Sipariş Tarihi</th>
              <th>Teslim Tarihi</th>
              <th>Tutar</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.Order_ID}>
                <td>#{order.Order_ID}</td>
                <td>{order.Customer_Name}</td>
                <td>{formatDate(order.Order_Date)}</td>
                <td>{formatDate(order.Delivery_Date)}</td>
                <td className="amount">{order.Total_Amount.toLocaleString('tr-TR')}₺</td>
                <td>
                  <span className={`status-badge ${order.Payment_Complete ? 'paid' : 'pending'}`}>
                    {order.Payment_Complete ? '✅ Ödendi' : '⏳ Bekliyor'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-view" 
                    onClick={() => viewOrderDetails(order.Order_ID)}
                  >
                    👁️ Detay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sipariş Detayı #{selectedOrder.Order_ID}</h3>
              <button onClick={() => setSelectedOrder(null)}>✖</button>
            </div>
            <div className="modal-body">
              <div className="order-info">
                <p><strong>Müşteri:</strong> {selectedOrder.Customer_Name}</p>
                <p><strong>Telefon:</strong> {selectedOrder.Phone}</p>
                <p><strong>Email:</strong> {selectedOrder.Email}</p>
                <p><strong>Sipariş Tarihi:</strong> {formatDate(selectedOrder.Order_Date)}</p>
                <p><strong>Vade Tarihi:</strong> {formatDate(selectedOrder.Due_Date)}</p>
              </div>

              <h4>Ürünler</h4>
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Miktar</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Name}</td>
                      <td>{item.Quantity}</td>
                      <td>{item.Unit_Price.toLocaleString('tr-TR')}₺</td>
                      <td>{(item.Quantity * item.Unit_Price).toLocaleString('tr-TR')}₺</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="order-total">
                <strong>Genel Toplam:</strong> {selectedOrder.Total_Amount.toLocaleString('tr-TR')}₺
              </div>

              {selectedOrder.payments.length > 0 && (
                <>
                  <h4>Ödemeler</h4>
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Tarih</th>
                        <th>Tutar</th>
                        <th>Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.payments.map(payment => (
                        <tr key={payment.Payment_ID}>
                          <td>{formatDate(payment.Payment_Date)}</td>
                          <td>{payment.Amount_Paid.toLocaleString('tr-TR')}₺</td>
                          <td>
                            <span className={`payment-status ${payment.Payment_Status.toLowerCase()}`}>
                              {payment.Payment_Status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
