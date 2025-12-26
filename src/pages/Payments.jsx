import { useState, useEffect } from 'react';
import api from '../services/api';
import '../pages/Orders.css';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await api.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Ödemeler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) return <div className="loading">💰 Yükleniyor...</div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>💰 Ödeme Yönetimi</h2>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Ödeme No</th>
              <th>Müşteri</th>
              <th>Sipariş No</th>
              <th>Tutar</th>
              <th>Tarih</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.Payment_ID}>
                <td>#{payment.Payment_ID}</td>
                <td>{payment.Customer_Name}</td>
                <td>#{payment.Order_ID}</td>
                <td className="amount">{payment.Amount_Paid.toLocaleString('tr-TR')}₺</td>
                <td>{formatDate(payment.Payment_Date)}</td>
                <td>
                  <span className={`payment-status ${payment.Payment_Status.toLowerCase()}`}>
                    {payment.Payment_Status === 'Paid' ? '✅ Ödendi' : 
                     payment.Payment_Status === 'Pending' ? '⏳ Bekliyor' : 
                     '❌ İptal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payments;
