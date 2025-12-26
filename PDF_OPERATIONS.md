# PDF Operations Implementation

## 4.2.1 Process Sales Order (Modifies Four Entities)

```javascript
// Yeni sipariş oluştur - 4.2.1 Process Sales Order
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { Customer_ID, Order_Date, Delivery_Date, Due_Date, products, newAddress } = req.body;
    
    // Validate Entity Existence - Check product quantities
    for (const item of products) {
      const [[product]] = await connection.query(
        'SELECT Current_Quantity FROM product WHERE Product_ID = ?',
        [item.Product_ID]
      );
      
      if (!product || product.Current_Quantity < item.Quantity) {
        throw new Error(`Yetersiz stok: Ürün ${item.Product_ID}`);
      }
    }
    
    // Verify customer exists
    const [[customer]] = await connection.query(
      'SELECT * FROM customer WHERE Customer_ID = ?',
      [Customer_ID]
    );
    
    if (!customer) {
      throw new Error('Müşteri bulunamadı');
    }
    
    // Instantiate Order Entity
    const [orderResult] = await connection.query(
      'INSERT INTO `order` (Customer_ID, Order_Date, Delivery_Date, Due_Date, Total_Amount) VALUES (?, ?, ?, ?, 0)',
      [Customer_ID, Order_Date, Delivery_Date, Due_Date]
    );
    
    const orderId = orderResult.insertId;
    let totalAmount = 0;
    
    // Add products and calculate total
    for (const item of products) {
      const [[product]] = await connection.query(
        'SELECT Product_ID, Unit_Price, Current_Quantity FROM product WHERE Product_ID = ? FOR UPDATE',
        [item.Product_ID]
      );
      
      if (!product) {
        throw new Error(`Ürün bulunamadı: ${item.Product_ID}`);
      }
      
      if (product.Current_Quantity < item.Quantity) {
        throw new Error(`Yetersiz stok! Ürün: ${item.Product_ID}, Mevcut: ${product.Current_Quantity}, İstenen: ${item.Quantity}`);
      }
      
      await connection.query(
        'INSERT INTO has (Order_ID, Product_ID, Quantity) VALUES (?, ?, ?)',
        [orderId, item.Product_ID, item.Quantity]
      );
      
      totalAmount += product.Unit_Price * item.Quantity;
      
      // Update Product Attributes - Decrease Current_Quantity
      await connection.query(
        'UPDATE product SET Current_Quantity = Current_Quantity - ? WHERE Product_ID = ?',
        [item.Quantity, item.Product_ID]
      );
    }
    
    // Update total amount
    await connection.query(
      'UPDATE `order` SET Total_Amount = ? WHERE Order_ID = ?',
      [totalAmount, orderId]
    );
    
    // Update Customer Attributes - Add new address if provided
    if (newAddress && newAddress.trim()) {
      await connection.query(
        'INSERT INTO customer_loc (Customer_ID, Customer_Address) VALUES (?, ?)',
        [Customer_ID, newAddress]
      );
    }
    
    // Instantiate Payment Entity - Create pending payment
    await connection.query(
      'INSERT INTO transaction_payment (Order_ID, Amount_Paid, Payment_Date, Payment_Status) VALUES (?, 0, CURDATE(), "Pending")',
      [orderId]
    );
    
    await connection.commit();
    res.status(201).json({ 
      message: 'Sipariş oluşturuldu',
      Order_ID: orderId,
      Total_Amount: totalAmount
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});
```

**File Location:** `backend/routes/orders.js`

**Affected Entities:**
1. ORDER - Insert new order
2. PRODUCT - Update Current_Quantity (decrease stock)
3. CUSTOMER - Insert customer_loc (add new address)
4. TRANSACTION - Insert pending payment

---

## 4.2.2 Process Customer Return (Implemented as Cancellation)

```javascript
// 4.2.2 Process Customer Cancellation
router.post('/cancel/:orderId', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const orderId = req.params.orderId;
    
    // Validate Cancellation Eligibility - Lock order row
    const [[order]] = await connection.query(
      'SELECT * FROM `order` WHERE Order_ID = ? FOR UPDATE',
      [orderId]
    );
    
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }
    
    // Check if already cancelled
    const [[existingCancel]] = await connection.query(
      'SELECT * FROM transaction_payment WHERE Order_ID = ? AND Payment_Status = "Cancelled"',
      [orderId]
    );
    
    if (existingCancel) {
      throw new Error('Bu sipariş zaten iptal edilmiş');
    }
    
    // Get order products
    const [orderProducts] = await connection.query(
      'SELECT * FROM has WHERE Order_ID = ?',
      [orderId]
    );
    
    // Update Product Attributes - Lock and restore stock
    for (const item of orderProducts) {
      // Lock product row to prevent concurrent stock issues
      await connection.query(
        'SELECT Product_ID FROM product WHERE Product_ID = ? FOR UPDATE',
        [item.Product_ID]
      );
      
      await connection.query(
        'UPDATE product SET Current_Quantity = Current_Quantity + ? WHERE Product_ID = ?',
        [item.Quantity, item.Product_ID]
      );
    }
    
    // Instantiate Transaction Entity - Create cancellation transaction (new row)
    // Negative amount to show refund, status = Cancelled
    await connection.query(
      'INSERT INTO transaction_payment (Order_ID, Amount_Paid, Payment_Date, Payment_Status) VALUES (?, ?, CURDATE(), ?)',
      [orderId, -order.Total_Amount, 'Cancelled']
    );
    
    // Update Order Attribute - Mark as cancelled (keep Total_Amount for display)
    await connection.query(
      'UPDATE `order` SET Payment_Complete = 0 WHERE Order_ID = ?',
      [orderId]
    );
    
    await connection.commit();
    res.json({ 
      message: 'Sipariş başarıyla iptal edildi',
      orderId: orderId 
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});
```

**File Location:** `backend/routes/customer.js`

**Affected Entities:**
1. ORDER - Update Payment_Complete to 0
2. PRODUCT - Restore Current_Quantity (increase stock)
3. TRANSACTION - Insert cancellation record with negative amount

**Note:** PDF requirement specifies "Refunded" status, but implementation uses "Cancelled" status.

---

## 4.2.3 Record Customer Payment (Modifies Two Entities)

```javascript
// 4.2.3 Record Customer Payment
router.post('/payment', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { Order_ID, Amount_Paid, Payment_Date, Payment_Status } = req.body;
    
    // Validate Order Association - Lock order row
    const [[order]] = await connection.query(
      'SELECT * FROM `order` WHERE Order_ID = ? FOR UPDATE',
      [Order_ID]
    );
    
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }
    
    if (order.Payment_Complete === 1) {
      throw new Error('Bu sipariş zaten tamamen ödenmiş');
    }
    
    // Instantiate Transaction Entity - Create payment record
    await connection.query(
      'INSERT INTO transaction_payment (Order_ID, Amount_Paid, Payment_Date, Payment_Status) VALUES (?, ?, ?, ?)',
      [Order_ID, Amount_Paid, Payment_Date, Payment_Status]
    );
    
    // Verify Aggregate Attributes - Calculate total paid (includes new payment)
    const [[totalPaid]] = await connection.query(
      'SELECT SUM(Amount_Paid) as total FROM transaction_payment WHERE Order_ID = ? AND Payment_Status != "Refunded" AND Payment_Status != "Cancelled"',
      [Order_ID]
    );
    
    // Update Order Attribute - Update payment status if fully paid
    if (totalPaid.total >= order.Total_Amount) {
      await connection.query(
        'UPDATE `order` SET Payment_Complete = 1 WHERE Order_ID = ?',
        [Order_ID]
      );
    }
    
    await connection.commit();
    res.json({ 
      message: 'Ödeme başarıyla kaydedildi',
      totalPaid: totalPaid.total,
      remainingBalance: order.Total_Amount - totalPaid.total
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});
```

**File Location:** `backend/routes/customer.js`

**Affected Entities:**
1. TRANSACTION - Insert payment record
2. ORDER - Update Payment_Complete to 1 if fully paid

**Additional Features:**
- Aggregate calculation excludes Cancelled and Refunded transactions
- Returns remaining balance to client
- Race condition protection with FOR UPDATE lock
