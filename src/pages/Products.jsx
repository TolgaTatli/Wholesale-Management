import { useState, useEffect } from 'react';
import api from '../services/api';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    Current_Quantity: 0,
    Unit_Price: 0,
    Reorder_Point: 0,
    Supplier_ID: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, suppliersData] = await Promise.all([
        api.getProducts(),
        api.getSuppliers()
      ]);
      setProducts(productsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Veriler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateProduct(editingId, formData);
      } else {
        await api.createProduct(formData);
      }
      resetForm();
      loadData();
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      Name: product.Name,
      Current_Quantity: product.Current_Quantity,
      Unit_Price: product.Unit_Price,
      Reorder_Point: product.Reorder_Point,
      Supplier_ID: product.Supplier_ID
    });
    setEditingId(product.Product_ID);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await api.deleteProduct(id);
        loadData();
      } catch (error) {
        alert('Silme hatası: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      Name: '',
      Current_Quantity: 0,
      Unit_Price: 0,
      Reorder_Point: 0,
      Supplier_ID: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">📦 Yükleniyor...</div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h2>📦 Ürün Yönetimi</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✖ İptal' : '+ Yeni Ürün'}
        </button>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Ürün Adı"
              value={formData.Name}
              onChange={(e) => setFormData({...formData, Name: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Mevcut Miktar"
              value={formData.Current_Quantity}
              onChange={(e) => setFormData({...formData, Current_Quantity: parseInt(e.target.value)})}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Birim Fiyat"
              value={formData.Unit_Price}
              onChange={(e) => setFormData({...formData, Unit_Price: parseFloat(e.target.value)})}
              required
            />
            <input
              type="number"
              placeholder="Yeniden Sipariş Noktası"
              value={formData.Reorder_Point}
              onChange={(e) => setFormData({...formData, Reorder_Point: parseInt(e.target.value)})}
              required
            />
            <select
              value={formData.Supplier_ID}
              onChange={(e) => setFormData({...formData, Supplier_ID: e.target.value})}
              required
            >
              <option value="">Tedarikçi Seçin</option>
              {suppliers.map(supplier => (
                <option key={supplier.Supplier_ID} value={supplier.Supplier_ID}>
                  {supplier.Name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? '💾 Güncelle' : '✅ Ekle'}
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product.Product_ID} className="product-card">
            <div className="product-header">
              <h3>{product.Name}</h3>
              <span className={`stock-badge ${product.Current_Quantity <= product.Reorder_Point ? 'low' : ''}`}>
                {product.Current_Quantity} adet
              </span>
            </div>
            <div className="product-details">
              <p><strong>Fiyat:</strong> {product.Unit_Price.toLocaleString('tr-TR')}₺</p>
              <p><strong>Tedarikçi:</strong> {product.Supplier_Name}</p>
              <p><strong>Min. Stok:</strong> {product.Reorder_Point}</p>
            </div>
            <div className="product-actions">
              <button className="btn-edit" onClick={() => handleEdit(product)}>✏️ Düzenle</button>
              <button className="btn-delete" onClick={() => handleDelete(product.Product_ID)}>🗑️ Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
