# 🏪 Wholesale Management System

Tam özellikli React + Node.js + MySQL toptan ticaret yönetim sistemi.

## 🚀 Hızlı Başlangıç

### 1. MySQL Kurulumu ve Veritabanı Setup

```bash
# MySQL yükleyin (https://dev.mysql.com/downloads/mysql/)
# PowerShell'de MySQL'e bağlanın:
mysql -u root -p

# Veritabanını oluşturun:
CREATE DATABASE warehouse_management CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;
USE warehouse_management;
exit;

# SQL dosyalarını import edin (database klasöründeyken):
cd database
mysql -u root -p warehouse_management < warehouse_management_supplier.sql
mysql -u root -p warehouse_management < warehouse_management_customer.sql
mysql -u root -p warehouse_management < warehouse_management_product.sql
mysql -u root -p warehouse_management < warehouse_management_order.sql
mysql -u root -p warehouse_management < warehouse_management_has.sql
mysql -u root -p warehouse_management < warehouse_management_customer_loc.sql
mysql -u root -p warehouse_management < warehouse_management_transaction_payment.sql
cd ..
```

### 2. Backend Setup

```bash
cd backend
npm install
# .env dosyasını düzenleyin (şifrenizi girin)
npm run dev
# Başarılı olursa: ✅ MySQL Bağlantısı Başarılı!
```

### 3. Frontend Setup

```bash
# Yeni terminal açın
npm install
npm run dev
# Tarayıcıda açılacak: http://localhost:5173
```

## 📂 Proje Yapısı

```
WholesaleManagement/
├── backend/              # Node.js + Express API
│   ├── config/          # Database bağlantısı
│   ├── routes/          # API endpoints
│   ├── server.js        # Express sunucu
│   └── .env            # Çevre değişkenleri
├── src/                 # React Frontend
│   ├── components/     # Navbar vb.
│   ├── pages/          # Dashboard, Products, Orders...
│   ├── services/       # API çağrıları
│   └── App.jsx         # Ana uygulama
└── database/           # SQL dosyaları
```

## ✨ Özellikler

- 📊 **Dashboard**: Gerçek zamanlı istatistikler ve uyarılar
- 📦 **Ürün Yönetimi**: CRUD işlemleri, stok takibi
- 🛒 **Sipariş Yönetimi**: Detaylı sipariş görüntüleme
- 👥 **Müşteri Yönetimi**: Müşteri bilgileri
- 🏭 **Tedarikçi Yönetimi**: Tedarikçi takibi
- 💰 **Ödeme Takibi**: Ödeme durumları

## 🔧 Teknolojiler

**Frontend:**
- React 19.2
- Vite 7
- Fetch API

**Backend:**
- Node.js + Express
- MySQL 8.0
- mysql2 driver

## 🌐 Arkadaşınızla Paylaşım

### Seçenek 1: Ngrok (Hızlı Test)
```bash
npm install -g ngrok
ngrok tcp 3306
# Aldığınız adresi arkadaşınıza verin
```

### Seçenek 2: PlanetScale (Ücretsiz Cloud)
1. https://planetscale.com adresine git
2. Veritabanı oluştur
3. Connection string'i kopyala
4. Backend .env dosyasını güncelle

## 🐛 Sorun Giderme

**MySQL bağlanamıyor:**
```bash
# MySQL servisinin çalıştığından emin olun
# Windows: services.msc -> MySQL80 -> Start
```

**Port 5000 kullanımda:**
```bash
# backend/.env dosyasında PORT'u değiştirin
PORT=5001
```

**CORS hatası:**
- Backend server.js'de CORS yapılandırması mevcut
- Frontend'de API_URL doğru olmalı (src/services/api.js)

## 📝 API Endpoints

```
GET    /api/products         - Tüm ürünleri listele
POST   /api/products         - Yeni ürün ekle
PUT    /api/products/:id     - Ürün güncelle
DELETE /api/products/:id     - Ürün sil

GET    /api/orders           - Siparişleri listele
GET    /api/orders/:id       - Sipariş detayı
POST   /api/orders           - Yeni sipariş

GET    /api/customers        - Müşterileri listele
GET    /api/suppliers        - Tedarikçileri listele
GET    /api/payments         - Ödemeleri listele
GET    /api/dashboard        - Dashboard istatistikleri
```

## 📄 Lisans

MIT License - Eğitim amaçlı kullanım için serbesttir.
