import { useState, useEffect } from 'react';
import api from '../services/api';
import './CustomerDashboard.css';

function CustomerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    loadProducts();
    loadMyOrders();
    loadAddresses();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    }
  };

  const loadMyOrders = async () => {
    try {
      const allOrders = await api.getOrders();
      const filtered = allOrders.filter(o => o.Customer_ID === user.customer.id);
      setMyOrders(filtered);
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await api.getCustomerAddresses(user.customer.id);
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddress(data[0].Customer_Address);
      }
    } catch (error) {
      console.error('Adresler yüklenemedi:', error);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.Product_ID === product.Product_ID);
    if (existing) {
      setCart(cart.map(item => 
        item.Product_ID === product.Product_ID 
          ? {...item, quantity: item.quantity + 1}
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.Product_ID !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.Product_ID === productId ? {...item, quantity} : item
    ));
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('⚠️ Sepetiniz boş!');
      return;
    }

    // Adres kontrolü (NOT NULL olduğu için zorunlu)
    const finalAddress = newAddress.trim() || selectedAddress;
    if (!finalAddress) {
      alert('⚠️ Teslimat adresi zorunludur!\nLütfen kayıtlı adreslerinizden birini seçin veya yeni adres girin.');
      return;
    }

    try {
      const orderDate = new Date();
      const deliveryDate = new Date(orderDate.getTime() + 7*24*60*60*1000); // 7 gün sonra
      
      const orderData = {
        Customer_ID: user.customer.id,
        Order_Date: orderDate.toISOString().split('T')[0],
        Delivery_Date: deliveryDate.toISOString().split('T')[0],
        Due_Date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        products: cart.map(item => ({
          Product_ID: item.Product_ID,
          Quantity: item.quantity
        })),
        deliveryAddress: finalAddress,
        newAddress: newAddress.trim() || null
      };

      await api.createOrder(orderData);
      alert('✅ Sipariş başarıyla oluşturuldu!\n📍 Teslimat: ' + finalAddress);
      setCart([]);
      setNewAddress('');
      setSelectedAddress(addresses.length > 0 ? addresses[0].Customer_Address : '');
      loadMyOrders();
      loadProducts();
      if (newAddress.trim()) {
        loadAddresses();
      }
    } catch (error) {
      alert('❌ Sipariş hatası: ' + error.message);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Bu siparişi iptal etmek istediğinize emin misiniz?\n\nÜrünler stoka geri eklenecek ve ödeme iade edilecektir.')) {
      return;
    }

    try {
      await api.cancelOrder(orderId);
      alert('✅ Sipariş iptal edildi!\n💰 Ödeme iadesi yapıldı\n📦 Ürünler stoka geri eklendi');
      loadMyOrders();
      loadProducts();
    } catch (error) {
      alert('❌ İptal hatası: ' + error.message);
    }
  };

  const makePayment = async (orderId, amount) => {
    if (!window.confirm(`${amount.toLocaleString('tr-TR')}₺ tutarında ödeme yapılacak. Onaylıyor musunuz?`)) {
      return;
    }

    try {
      await api.makePayment({
        Order_ID: orderId,
        Amount_Paid: amount,
        Payment_Date: new Date().toISOString().split('T')[0],
        Payment_Status: 'Paid'
      });
      alert('✅ Ödeme başarılı!');
      loadMyOrders();
    } catch (error) {
      alert('Ödeme hatası: ' + error.message);
    }
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + (item.Unit_Price * item.quantity), 0);

  return (
    <div className="customer-dashboard">
      <header className="customer-header">
        <div className="customer-info">
          <h2>👤 {user.customer.name}</h2>
          <p>Müşteri Paneli</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          🚪 Çıkış
        </button>
      </header>

      <nav className="customer-tabs">
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Sipariş Ver
        </button>
        <button 
          className={activeTab === 'myorders' ? 'active' : ''}
          onClick={() => setActiveTab('myorders')}
        >
          📋 Siparişlerim
        </button>
      </nav>

      {activeTab === 'orders' && (
        <div className="order-section">
          <div className="products-section">
            <h3>📦 Ürünler</h3>
            <div className="products-grid">
              {products.map(product => (
                <div key={product.Product_ID} className="product-card-customer">
                  <h4>{product.Name}</h4>
                  <p className="price">{product.Unit_Price.toLocaleString('tr-TR')}₺</p>
                  <p className="stock">Stok: {product.Current_Quantity}</p>
                  <button 
                    className="add-cart-btn"
                    onClick={() => addToCart(product)}
                    disabled={product.Current_Quantity <= 0}
                  >
                    {product.Current_Quantity > 0 ? '+ Sepete Ekle' : 'Stokta Yok'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-section">
            <h3>🛒 Sepetim</h3>
            {cart.length === 0 ? (
              <p className="empty-cart">Sepetiniz boş</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.Product_ID} className="cart-item">
                    <div className="cart-item-info">
                      <strong>{item.Name}</strong>
                      <p>{item.Unit_Price.toLocaleString('tr-TR')}₺ x {item.quantity}</p>
                    </div>
                    <div className="cart-item-actions">
                      <input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.Product_ID, parseInt(e.target.value))}
                        className="quantity-input"
                      />
                      <button onClick={() => removeFromCart(item.Product_ID)}>🗑️</button>
                    </div>
                  </div>
                ))}

                <div className="address-section">
                  <label>📍 Teslimat Adresi: <span className="required">*</span></label>
                  
                  {addresses.length > 0 && (
                    <div className="existing-addresses">
                      <p className="address-label">Kayıtlı Adreslerim:</p>
                      {addresses.map((addr, index) => (
                        <label key={index} className="address-option">
                          <input 
                            type="radio"
                            name="address"
                            value={addr.Customer_Address}
                            checked={selectedAddress === addr.Customer_Address && !newAddress}
                            onChange={(e) => {
                              setSelectedAddress(e.target.value);
                              setNewAddress('');
                            }}
                          />
                          <span>{addr.Customer_Address}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="new-address-input">
                    <p className="address-label">Veya Yeni Adres Ekle:</p>
                    <input 
                      type="text"
                      value={newAddress}
                      onChange={(e) => {
                        setNewAddress(e.target.value);
                        if (e.target.value.trim()) {
                          setSelectedAddress('');
                        }
                      }}
                      placeholder="Yeni adres girin (database'e kaydedilir)..."
                    />
                  </div>
                </div>

                <button className="place-order-btn" onClick={placeOrder}>
                  ✅ Siparişi Tamamla
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'myorders' && (
        <div className="myorders-section">
          <h3>📋 Siparişlerim</h3>
          {myOrders.length === 0 ? (
            <p className="no-orders">Henüz sipariş yok</p>
          ) : (
            <div className="orders-list">
              {myOrders.map(order => (
                <div key={order.Order_ID} className="order-card">
                  <div className="order-header-customer">
                    <h4>Sipariş #{order.Order_ID}</h4>
                    <span className={`order-status ${order.Cancelled_Status === 'Cancelled' ? 'cancelled' : order.Payment_Complete ? 'paid' : 'pending'}`}>
                      {order.Cancelled_Status === 'Cancelled' ? '❌ İptal Edildi' : order.Payment_Complete ? '✅ Ödendi' : '⏳ Bekliyor'}
                    </span>
                  </div>
                  <div className="order-details-customer">
                    <p><strong>Tutar:</strong> {order.Total_Amount.toLocaleString('tr-TR')}₺</p>
                    <p><strong>Tarih:</strong> {new Date(order.Order_Date).toLocaleDateString('tr-TR')}</p>
                    <p><strong>Teslim:</strong> {order.Delivery_Date ? new Date(order.Delivery_Date).toLocaleDateString('tr-TR') : '-'}</p>
                    {order.Cancelled_Status === 'Cancelled' && (
                      <div className="refund-notice">
                        💰 Hesabınıza {order.Refunded_Amount?.toLocaleString('tr-TR') || '0'}₺ iade edildi
                      </div>
                    )}
                  </div>
                  <div className="order-actions-customer">
                    {order.Cancelled_Status === 'Cancelled' ? (
                      <button className="cancelled-status" disabled>
                        ❌ İptal Edildi
                      </button>
                    ) : (
                      <>
                        {!order.Payment_Complete && order.Total_Amount > 0 && (
                          <button className="pay-btn" onClick={() => makePayment(order.Order_ID, order.Total_Amount)}>
                            💳 Ödeme Yap
                          </button>
                        )}
                        {order.Payment_Complete && (
                          <button className="cancel-btn" onClick={() => cancelOrder(order.Order_ID)}>
                            ❌ İptal Et
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
