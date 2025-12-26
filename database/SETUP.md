# MySQL Kurulum ve Veritabanı Setup Rehberi

## 1. MySQL Kurulumu

### Windows için:
1. **MySQL İndir**: https://dev.mysql.com/downloads/mysql/
2. **MySQL Installer Community** seçin (450MB)
3. Yüklerken:
   - Developer Default seçin
   - Root şifresi belirleyin (örn: `root123`)
   - Port: 3306 (varsayılan)

### Hızlı Test:
```bash
# PowerShell'de MySQL'in çalışıp çalışmadığını kontrol et
mysql --version
```

## 2. Veritabanını Oluşturma

### PowerShell'de MySQL'e bağlan:
```bash
mysql -u root -p
# Şifrenizi girin
```

### Veritabanını oluştur:
```sql
CREATE DATABASE warehouse_management CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;
USE warehouse_management;
```

## 3. Tabloları İçe Aktar (DOĞRU SIRA ÖNEMLİ!)

```bash
# PowerShell'de, projenin database klasöründeyken:
cd "C:\Users\Tolga Tatlı\Desktop\WholesaleManagement\database"

# Sırayla import et:
mysql -u root -p warehouse_management < warehouse_management_supplier.sql
mysql -u root -p warehouse_management < warehouse_management_customer.sql
mysql -u root -p warehouse_management < warehouse_management_product.sql
mysql -u root -p warehouse_management < warehouse_management_order.sql
mysql -u root -p warehouse_management < warehouse_management_has.sql
mysql -u root -p warehouse_management < warehouse_management_customer_loc.sql
mysql -u root -p warehouse_management < warehouse_management_transaction_payment.sql
```

## 4. Kontrol Et

```sql
-- MySQL console'da:
USE warehouse_management;
SHOW TABLES;
SELECT * FROM customer;
SELECT * FROM product;
```

## 5. Arkadaşınla Paylaşım Seçenekleri

### A) Ngrok ile Paylaşım (Hızlı)
```bash
npm install -g ngrok
ngrok tcp 3306
# Size bir adres verecek: tcp://0.tcp.ngrok.io:12345
```

### B) PlanetScale (Önerilen - Ücretsiz)
1. https://planetscale.com adresine git
2. "Sign up" ile GitHub hesabınla giriş yap
3. "Create database" tıkla
4. Database adını ver: `warehouse_management`
5. Connection string'i kopyala

## Bağlantı Bilgileri

Projedeki `.env` dosyasına ekle:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=44t#21wtf
DB_NAME=warehouse_management
DB_PORT=3306
```
