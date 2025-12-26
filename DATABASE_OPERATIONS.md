# 📊 DATABASE İŞLEMLERİ - KOMPLE DÖKÜMANTASYON

## Wholesale Management System - Tüm SQL İşlemleri

---

## 1️⃣ ORDERS (Sipariş İşlemleri) - `routes/orders.js`

### GET /api/orders - Tüm Siparişleri Listele

```sql
SELECT o.*, c.Name as Customer_Name,
  (SELECT Payment_Status FROM transaction_payment 
   WHERE Order_ID = o.Order_ID 
   AND Payment_Status = 'Cancelled' 
   LIMIT 1) as Cancelled_Status,
  (SELECT ABS(Amount_Paid) FROM transaction_payment 
   WHERE Order_ID = o.Order_ID 
   AND Payment_Status = 'Cancelled' 
   LIMIT 1) as Refunded_Amount
FROM `order` o 
LEFT JOIN customer c ON o.Customer_ID = c.Customer_ID
ORDER BY o.Order_ID DESC
```

**Etkilenen Tablolar:** `order`, `customer`, `transaction_payment`

**Ne Yapar:**
- Tüm siparişleri getirir
- Müşteri adını ekler (LEFT JOIN)
- İptal durumunu kontrol eder (subquery)
- İade edilen tutarı hesaplar (subquery)

**Frontend Kullanım:**
- Admin Dashboard → Orders sayfası
- Customer Dashboard → Siparişlerim sekmesi

---

### GET /api/orders/:id - Sipariş Detayı

```sql
-- Sipariş bilgisi
SELECT o.*, c.Name as Customer_Name, c.Phone, c.Email 
FROM `order` o 
LEFT JOIN customer c ON o.Customer_ID = c.Customer_ID
WHERE o.Order_ID = ?

-- Siparişteki ürünler
SELECT h.*, p.Name, p.Unit_Price 
FROM has h
LEFT JOIN product p ON h.Product_ID = p.Product_ID
WHERE h.Order_ID = ?

-- Ödemeler
SELECT * FROM transaction_payment WHERE Order_ID = ?
```

**Etkilenen Tablolar:** `order`, `customer`, `has`, `product`, `transaction_payment`

**Ne Yapar:**
- Tek sipariş detayını getirir
- Müşteri bilgilerini ekler
- Siparişteki tüm ürünleri listeler (has tablosu)
- Sipariş ödemelerini getirir

**Frontend Kullanım:**
- Admin Dashboard → Sipariş detay modalları

---

### POST /api/orders - Yeni Sipariş Oluştur (4.2.1 Process Sales Order)

```sql
-- 1. Stok kontrolü (her ürün için)
SELECT Current_Quantity FROM product WHERE Product_ID = ?

-- 2. Müşteri kontrolü
SELECT * FROM customer WHERE Customer_ID = ?

-- 3. Sipariş oluştur
INSERT INTO `order` (Customer_ID, Order_Date, Delivery_Date, Due_Date, Total_Amount) 
VALUES (?, ?, ?, ?, 0)

-- 4. Sipariş-ürün ilişkisi ekle (her ürün için)
INSERT INTO has (Order_ID, Product_ID, Quantity) VALUES (?, ?, ?)

-- 5. Ürün fiyatı al (her ürün için)
SELECT Unit_Price FROM product WHERE Product_ID = ?

-- 6. Stok azalt (her ürün için)
UPDATE product SET Current_Quantity = Current_Quantity - ? WHERE Product_ID = ?

-- 7. Toplam tutarı güncelle
UPDATE `order` SET Total_Amount = ? WHERE Order_ID = ?

-- 8. Yeni adres ekle (varsa)
INSERT INTO customer_loc (Customer_ID, Customer_Address) VALUES (?, ?)

-- 9. Bekleyen ödeme kaydı oluştur
INSERT INTO transaction_payment (Order_ID, Amount_Paid, Payment_Date, Payment_Status) 
VALUES (?, 0, CURDATE(), "Pending")
```

**Etkilenen Tablolar:** `product`, `customer`, `order`, `has`, `customer_loc`, `transaction_payment`

**İşlem Adımları:**
1. Her ürün için stok yeterli mi kontrol et
2. Müşteri var mı kontrol et
3. Yeni sipariş kaydı oluştur (Total_Amount başlangıçta 0)
4. Her ürün için `has` tablosuna kayıt ekle (sipariş-ürün ilişkisi)
5. Her ürünün fiyatını al ve toplam tutarı hesapla
6. Her ürünün stokunu azalt
7. Siparişin toplam tutarını güncelle
8. Eğer yeni adres girildiyse `customer_loc` tablosuna ekle
9. "Pending" statüsünde ödeme kaydı oluştur

**Frontend Kullanım:**
- Customer Dashboard → Sipariş Ver sekmesi → Siparişi Tamamla butonu

**Transaction Kullanımı:** ✅ **Evet**
- `BEGIN TRANSACTION`
- Herhangi bir hata olursa `ROLLBACK`
- Başarılıysa `COMMIT`

**Hata Durumları:**
- Stok yetersiz → Rollback, hata mesajı
- Müşteri bulunamadı → Rollback, hata mesajı

---

### PUT /api/orders/:id - Sipariş Güncelle

```sql
UPDATE `order` SET Delivery_Date=?, Due_Date=?, Payment_Complete=? WHERE Order_ID=?
```

**Etkilenen Tablolar:** `order`

**Ne Yapar:**
- Teslimat tarihini günceller
- Vade tarihini günceller
- Ödeme durumunu günceller

**Frontend Kullanım:**
- Admin Dashboard → Orders sayfası (manuel güncelleme)

---

### DELETE /api/orders/:id - Sipariş Sil

```sql
DELETE FROM `order` WHERE Order_ID = ?
```

**Etkilenen Tablolar:** `order` (CASCADE ile `has`, `transaction_payment` de silinir)

**Ne Yapar:**
- Siparişi siler
- Foreign key CASCADE nedeniyle bağlı kayıtlar otomatik silinir

**Frontend Kullanım:**
- Admin Dashboard → Orders sayfası

**⚠️ Dikkat:** Gerçek üretimde kullanılmamalı (tarihçe kaybı)

---

## 2️⃣ CUSTOMER OPERATIONS (Müşteri İşlemleri) - `routes/customer.js`

### POST /api/customer/cancel/:orderId - Sipariş İptal (4.2.2 Process Customer Cancellation)

```sql
-- 1. Sipariş kontrolü
SELECT * FROM `order` WHERE Order_ID = ?

-- 2. Daha önce iptal edilmiş mi kontrol
SELECT * FROM transaction_payment WHERE Order_ID = ? AND Payment_Status = "Cancelled"

-- 3. Siparişteki ürünleri getir
SELECT * FROM has WHERE Order_ID = ?

-- 4. Stokları geri yükle (her ürün için)
UPDATE product SET Current_Quantity = Current_Quantity + ? WHERE Product_ID = ?

-- 5. İptal kaydı oluştur (negatif tutar)
INSERT INTO transaction_payment (Order_ID, Amount_Paid, Payment_Date, Payment_Status) 
VALUES (?, -Total_Amount, CURDATE(), 'Cancelled')

-- 6. Sipariş durumunu güncelle
UPDATE `order` SET Payment_Complete = 0 WHERE Order_ID = ?
```

**Etkilenen Tablolar:** `order`, `has`, `product`, `transaction_payment`

**İşlem Adımları:**
1. Sipariş var mı kontrol et
2. Daha önce iptal edilmiş mi kontrol et (çift iptal engelleme)
3. Siparişteki ürünleri getir
4. Her ürün için stoğu geri yükle (iade)
5. Negatif tutarlı "Cancelled" ödeme kaydı ekle (para iadesi)
6. Payment_Complete = 0 yap (Total_Amount değişmez, tarihçe için)

**Frontend Kullanım:**
- Customer Dashboard → Siparişlerim → İptal Et butonu

**Transaction Kullanımı:** ✅ **Evet**

**Önemli Notlar:**
- Negatif tutar: Para iadesi gösterimi
- Total_Amount değişmez: Tarihçe için saklanır
- Stoklar geri yüklenir: Ürünler tekrar satılabilir

---

### POST /api/customer/payment - Ödeme Kaydet (4.2.3 Record Customer Payment)

```sql
-- 1. Sipariş kontrolü
SELECT * FROM `order` WHERE Order_ID = ?

-- 2. Ödeme kaydı oluştur
INSERT INTO transaction_payment (Order_ID, Amount_Paid, Payment_Date, Payment_Status) 
VALUES (?, ?, ?, ?)

-- 3. Toplam ödemeyi hesapla
SELECT SUM(Amount_Paid) as total 
FROM transaction_payment 
WHERE Order_ID = ? AND Payment_Status != "Refunded"

-- 4. Tam ödendiğinde durumu güncelle
UPDATE `order` SET Payment_Complete = 1 WHERE Order_ID = ?
```

**Etkilenen Tablolar:** `order`, `transaction_payment`

**İşlem Adımları:**
1. Sipariş var mı kontrol et
2. Yeni ödeme kaydı ekle
3. Bu siparişin toplam ödenen tutarını hesapla
4. Toplam ödeme >= sipariş tutarı ise Payment_Complete = 1

**Frontend Kullanım:**
- Customer Dashboard → Siparişlerim → Ödeme Yap butonu

**Transaction Kullanımı:** ✅ **Evet**

**Özellikler:**
- Kısmi ödeme destekler (birden fazla ödeme kaydı)
- Tam ödendiğinde otomatik Payment_Complete günceller

---

## 3️⃣ CUSTOMERS (Müşteri CRUD) - `routes/customers.js`

### GET /api/customers - Müşteri Listesi

```sql
SELECT * FROM customer ORDER BY Customer_ID DESC
```

**Etkilenen Tablolar:** `customer`

**Frontend Kullanım:** Admin Dashboard → Customers sayfası

---

### GET /api/customers/:id - Müşteri Detayı

```sql
-- Müşteri bilgisi
SELECT * FROM customer WHERE Customer_ID = ?

-- Müşteri adresleri
SELECT * FROM customer_loc WHERE Customer_ID = ?
```

**Etkilenen Tablolar:** `customer`, `customer_loc`

**Frontend Kullanım:**
- Admin Dashboard → Customer detay
- Login ekranı → Müşteri seçimi

---

### GET /api/customers/:id/addresses - Müşteri Adresleri

```sql
SELECT Customer_Address FROM customer_loc WHERE Customer_ID = ?
```

**Etkilenen Tablolar:** `customer_loc`

**Frontend Kullanım:**
- Customer Dashboard → Sipariş verirken adres seçimi

---

### POST /api/customers - Yeni Müşteri

```sql
-- Müşteri ekle
INSERT INTO customer (Name, Phone, Email) VALUES (?, ?, ?)

-- Adresler ekle (her biri için)
INSERT INTO customer_loc (Customer_ID, Customer_Address) VALUES (?, ?)
```

**Etkilenen Tablolar:** `customer`, `customer_loc`

**Frontend Kullanım:** Admin Dashboard → Add Customer

---

### PUT /api/customers/:id - Müşteri Güncelle

```sql
UPDATE customer SET Name=?, Phone=?, Email=? WHERE Customer_ID=?
```

**Etkilenen Tablolar:** `customer`

**Frontend Kullanım:** Admin Dashboard → Edit Customer

---

### DELETE /api/customers/:id - Müşteri Sil

```sql
DELETE FROM customer WHERE Customer_ID = ?
```

**Etkilenen Tablolar:** `customer` (CASCADE ile `customer_loc` de silinir)

**Frontend Kullanım:** Admin Dashboard → Delete Customer

---

## 4️⃣ PRODUCTS (Ürün CRUD) - `routes/products.js`

### GET /api/products - Ürün Listesi

```sql
SELECT p.*, s.Name as Supplier_Name 
FROM product p 
LEFT JOIN supplier s ON p.Supplier_ID = s.Supplier_ID
ORDER BY p.Product_ID DESC
```

**Etkilenen Tablolar:** `product`, `supplier`

**Frontend Kullanım:**
- Admin Dashboard → Products sayfası
- Customer Dashboard → Sipariş Ver → Ürün listesi

---

### GET /api/products/:id - Ürün Detayı

```sql
SELECT p.*, s.Name as Supplier_Name 
FROM product p 
LEFT JOIN supplier s ON p.Supplier_ID = s.Supplier_ID 
WHERE p.Product_ID = ?
```

**Etkilenen Tablolar:** `product`, `supplier`

**Frontend Kullanım:** Admin Dashboard → Product detay

---

### POST /api/products - Yeni Ürün

```sql
INSERT INTO product (Name, Current_Quantity, Unit_Price, Reorder_Point, Supplier_ID) 
VALUES (?, ?, ?, ?, ?)
```

**Etkilenen Tablolar:** `product`

**Frontend Kullanım:** Admin Dashboard → Add Product

---

### PUT /api/products/:id - Ürün Güncelle

```sql
UPDATE product SET Name=?, Current_Quantity=?, Unit_Price=?, Reorder_Point=?, Supplier_ID=? 
WHERE Product_ID=?
```

**Etkilenen Tablolar:** `product`

**Frontend Kullanım:** Admin Dashboard → Edit Product

---

### DELETE /api/products/:id - Ürün Sil

```sql
DELETE FROM product WHERE Product_ID = ?
```

**Etkilenen Tablolar:** `product`

**Frontend Kullanım:** Admin Dashboard → Delete Product

---

## 5️⃣ SUPPLIERS (Tedarikçi CRUD) - `routes/suppliers.js`

### GET /api/suppliers - Tedarikçi Listesi

```sql
SELECT * FROM supplier ORDER BY Supplier_ID DESC
```

**Etkilenen Tablolar:** `supplier`

**Frontend Kullanım:** Admin Dashboard → Suppliers sayfası

---

### GET /api/suppliers/:id - Tek Tedarikçi

```sql
SELECT * FROM supplier WHERE Supplier_ID = ?
```

**Etkilenen Tablolar:** `supplier`

**Frontend Kullanım:** Admin Dashboard → Supplier detay

---

### POST /api/suppliers - Yeni Tedarikçi

```sql
INSERT INTO supplier (Name, Contact_Person, Address, Payment_Terms) 
VALUES (?, ?, ?, ?)
```

**Etkilenen Tablolar:** `supplier`

**Frontend Kullanım:** Admin Dashboard → Add Supplier

---

### PUT /api/suppliers/:id - Tedarikçi Güncelle

```sql
UPDATE supplier SET Name=?, Contact_Person=?, Address=?, Payment_Terms=? 
WHERE Supplier_ID=?
```

**Etkilenen Tablolar:** `supplier`

**Frontend Kullanım:** Admin Dashboard → Edit Supplier

---

### DELETE /api/suppliers/:id - Tedarikçi Sil

```sql
DELETE FROM supplier WHERE Supplier_ID = ?
```

**Etkilenen Tablolar:** `supplier`

**Frontend Kullanım:** Admin Dashboard → Delete Supplier

---

## 6️⃣ PAYMENTS (Ödeme Listesi) - `routes/payments.js`

### GET /api/payments - Tüm Ödemeleri Listele

```sql
SELECT tp.*, o.Order_ID, c.Name as Customer_Name
FROM transaction_payment tp
LEFT JOIN `order` o ON tp.Order_ID = o.Order_ID
LEFT JOIN customer c ON o.Customer_ID = c.Customer_ID
ORDER BY tp.Payment_ID DESC
```

**Etkilenen Tablolar:** `transaction_payment`, `order`, `customer`

**Ne Yapar:**
- Tüm ödeme kayıtlarını getirir
- Sipariş bilgisini ekler
- Müşteri adını ekler

**Frontend Kullanım:** Admin Dashboard → Payments sayfası

---

### POST /api/payments - Ödeme Ekle

```sql
INSERT INTO transaction_payment (Order_ID, Amount_Paid, Payment_Date, Payment_Status) 
VALUES (?, ?, ?, ?)
```

**Etkilenen Tablolar:** `transaction_payment`

**Frontend Kullanım:** Admin Dashboard → Add Payment

---

### PUT /api/payments/:id - Ödeme Güncelle

```sql
UPDATE transaction_payment SET Payment_Status=?, Amount_Paid=? WHERE Payment_ID=?
```

**Etkilenen Tablolar:** `transaction_payment`

**Frontend Kullanım:** Admin Dashboard → Edit Payment

---

## 7️⃣ DASHBOARD (İstatistikler) - `server.js`

### GET /api/dashboard - Dashboard İstatistikleri

```sql
-- Toplam ürün sayısı
SELECT COUNT(*) as count FROM product

-- Toplam müşteri sayısı
SELECT COUNT(*) as count FROM customer

-- Toplam sipariş sayısı
SELECT COUNT(*) as count FROM `order`

-- Toplam gelir
SELECT SUM(Total_Amount) as total FROM `order`

-- Bekleyen siparişler
SELECT COUNT(*) as count FROM `order` WHERE Payment_Complete = 0

-- Düşük stoklu ürünler
SELECT * FROM product 
WHERE Current_Quantity <= Reorder_Point 
ORDER BY Current_Quantity ASC 
LIMIT 10
```

**Etkilenen Tablolar:** `product`, `customer`, `order`

**Ne Yapar:**
- Sistem geneli istatistikler
- Dashboard kartları için veri
- Düşük stok uyarısı

**Frontend Kullanım:** Admin Dashboard → Ana sayfa

---

## 🎯 ÖNEMLİ NOKTALAR

### Transaction Kullanımı (BEGIN/COMMIT/ROLLBACK)

✅ **Transaction kullanılan endpoint'ler:**
1. `POST /api/orders` - Sipariş oluştur
2. `POST /api/customer/cancel` - Sipariş iptal
3. `POST /api/customer/payment` - Ödeme kaydet

**Neden Transaction?**
- Birden fazla tablo etkileniyor
- Atomicity gerekli (ya hepsi ya hiçbiri)
- Veri tutarlılığı kritik

**Transaction Olmayan İşlemler:**
- Basit SELECT sorgular
- Tek tablo UPDATE/DELETE
- CRUD işlemleri

---

### Etkilenen Ana Tablolar ve İlişkiler

#### 1. **order** (Siparişler)
- `Customer_ID` → `customer` (müşteri)
- Oluşturma: Sipariş ver
- Güncelleme: Ödeme yapılınca `Payment_Complete = 1`
- İptal: `Payment_Complete = 0` (Total_Amount değişmez)

#### 2. **product** (Ürünler)
- `Supplier_ID` → `supplier` (tedarikçi)
- Stok azalma: Sipariş oluştur
- Stok artma: Sipariş iptal

#### 3. **transaction_payment** (Ödemeler)
- `Order_ID` → `order` (sipariş)
- Ekleme: Ödeme yap, Sipariş oluştur (Pending), İptal et (negatif tutar)
- Durum: `Pending`, `Paid`, `Cancelled`

#### 4. **has** (Sipariş-Ürün İlişkisi)
- `Order_ID` → `order`
- `Product_ID` → `product`
- Ekleme: Sipariş oluştur
- Kullanım: Sipariş detay, Stok kontrolü

#### 5. **customer_loc** (Müşteri Adresleri)
- `Customer_ID` → `customer`
- Ekleme: Sipariş verirken yeni adres
- Kullanım: Adres seçimi

#### 6. **customer** (Müşteriler)
- Kullanım: Login, Sipariş oluştur, Adres yönetimi

#### 7. **supplier** (Tedarikçiler)
- Kullanım: Ürün yönetimi, Stok takibi

---

### Kritik İşlem Akışları

#### Sipariş Oluşturma Akışı (4.2.1)
```
1. Frontend: Sepet + Adres seçimi → POST /api/orders
2. Backend:
   a. Transaction başlat
   b. Stok kontrolü (her ürün için)
   c. Müşteri kontrolü
   d. Order INSERT (Total_Amount=0)
   e. has INSERT (her ürün için)
   f. Product UPDATE (stok azalt)
   g. Order UPDATE (Total_Amount güncelle)
   h. customer_loc INSERT (yeni adres varsa)
   i. transaction_payment INSERT (Pending)
   j. Commit
3. Frontend: Başarı mesajı, listeleri yenile
```

#### Sipariş İptal Akışı (4.2.2)
```
1. Frontend: İptal Et butonu → POST /api/customer/cancel/:id
2. Backend:
   a. Transaction başlat
   b. Sipariş kontrolü
   c. İptal edilmiş mi kontrolü
   d. has SELECT (ürünleri al)
   e. Product UPDATE (stokları geri yükle)
   f. transaction_payment INSERT (negatif tutar, Cancelled)
   g. Order UPDATE (Payment_Complete=0)
   h. Commit
3. Frontend: İptal mesajı, listeleri yenile
```

#### Ödeme Yapma Akışı (4.2.3)
```
1. Frontend: Ödeme Yap butonu → POST /api/customer/payment
2. Backend:
   a. Transaction başlat
   b. Sipariş kontrolü
   c. transaction_payment INSERT (Paid)
   d. SUM hesapla (toplam ödenen)
   e. Eğer tam ödendiyse: Order UPDATE (Payment_Complete=1)
   f. Commit
3. Frontend: Başarı mesajı, listeleri yenile
```

---

### Veri Akışı Şeması

```
Customer Dashboard:
├── Sipariş Ver
│   ├── GET /api/products (ürünleri listele)
│   ├── GET /api/customers/:id/addresses (adresleri getir)
│   └── POST /api/orders (sipariş oluştur)
│       ├── INSERT order
│       ├── INSERT has
│       ├── UPDATE product (stok)
│       ├── INSERT customer_loc (yeni adres)
│       └── INSERT transaction_payment (Pending)
│
└── Siparişlerim
    ├── GET /api/orders (siparişleri listele)
    ├── POST /api/customer/payment (ödeme yap)
    │   ├── INSERT transaction_payment (Paid)
    │   └── UPDATE order (Payment_Complete)
    └── POST /api/customer/cancel/:id (iptal et)
        ├── SELECT has (ürünleri al)
        ├── UPDATE product (stok geri)
        ├── INSERT transaction_payment (Cancelled)
        └── UPDATE order (Payment_Complete=0)

Admin Dashboard:
├── Dashboard
│   └── GET /api/dashboard (istatistikler)
│       ├── SELECT COUNT(*) FROM product
│       ├── SELECT COUNT(*) FROM customer
│       ├── SELECT COUNT(*) FROM order
│       └── SELECT SUM(Total_Amount) FROM order
│
├── Products (CRUD)
│   ├── GET /api/products
│   ├── POST /api/products
│   ├── PUT /api/products/:id
│   └── DELETE /api/products/:id
│
├── Customers (CRUD)
│   ├── GET /api/customers
│   ├── POST /api/customers
│   ├── PUT /api/customers/:id
│   └── DELETE /api/customers/:id
│
├── Orders (CRUD)
│   ├── GET /api/orders
│   ├── GET /api/orders/:id (detay)
│   ├── PUT /api/orders/:id
│   └── DELETE /api/orders/:id
│
├── Suppliers (CRUD)
│   ├── GET /api/suppliers
│   ├── POST /api/suppliers
│   ├── PUT /api/suppliers/:id
│   └── DELETE /api/suppliers/:id
│
└── Payments (View)
    └── GET /api/payments
```

---

## 📝 Özet

### Toplam Endpoint Sayısı: 28

**CRUD İşlemleri:**
- Products: 5 endpoint (GET, GET/:id, POST, PUT, DELETE)
- Customers: 6 endpoint (GET, GET/:id, GET/:id/addresses, POST, PUT, DELETE)
- Orders: 5 endpoint (GET, GET/:id, POST, PUT, DELETE)
- Suppliers: 5 endpoint (GET, GET/:id, POST, PUT, DELETE)
- Payments: 3 endpoint (GET, POST, PUT)

**Özel İşlemler:**
- Customer Operations: 2 endpoint (cancel, payment)
- Dashboard: 1 endpoint (istatistikler)
- Health Check: 1 endpoint

### Transaction Gerektiren İşlemler: 3
1. Sipariş oluştur (7 tablo etkilenir)
2. Sipariş iptal (4 tablo etkilenir)
3. Ödeme kaydet (2 tablo etkilenir)

### Toplam Tablo Sayısı: 7
1. **order** - Siparişler
2. **product** - Ürünler
3. **customer** - Müşteriler
4. **supplier** - Tedarikçiler
5. **has** - Sipariş-Ürün İlişkisi
6. **customer_loc** - Müşteri Adresleri
7. **transaction_payment** - Ödeme Kayıtları

---

## 🔒 Güvenlik ve En İyi Uygulamalar

### ✅ Yapılanlar
- Parameterized queries (SQL Injection koruması)
- Transaction kullanımı (veri tutarlılığı)
- Error handling (try-catch blokları)
- Connection pooling (performans)

### ⚠️ İyileştirme Önerileri
- Authentication/Authorization eklenmeli
- Input validation güçlendirilmeli
- Soft delete kullanılmalı (DELETE yerine)
- Audit log tutulmalı
- Rate limiting eklenmeli

---

**Son Güncelleme:** 26 Aralık 2025  
**Proje:** Wholesale Management System  
**Database:** MySQL 8.0  
**Backend:** Node.js + Express + mysql2
