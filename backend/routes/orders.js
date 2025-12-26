import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Tüm siparişleri getir
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, c.Name as Customer_Name,
        (SELECT Payment_Status FROM transaction_payment 
         WHERE Order_ID = o.Order_ID 
         AND Payment_Status = 'Cancelled' 
         LIMIT 1) as Cancelled_Status,
        (SELECT ABS(Amount_Paid) FROM transaction_payment 
         WHERE Order_ID = o.Order_ID 
         AND Payment_Status = 'Cancelled' 
         LIMIT 1) as Refunded_Amount
      FROM \`order\` o 
      LEFT JOIN customer c ON o.Customer_ID = c.Customer_ID
      ORDER BY o.Order_ID DESC
    `);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sipariş detayı ve ürünleri getir
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, c.Name as Customer_Name, c.Phone, c.Email 
      FROM \`order\` o 
      LEFT JOIN customer c ON o.Customer_ID = c.Customer_ID
      WHERE o.Order_ID = ?
    `, [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    
    // Sipariş ürünlerini getir
    const [products] = await pool.query(`
      SELECT h.*, p.Name, p.Unit_Price 
      FROM has h
      LEFT JOIN product p ON h.Product_ID = p.Product_ID
      WHERE h.Order_ID = ?
    `, [req.params.id]);
    
    // Ödemeleri getir
    const [payments] = await pool.query(`
      SELECT * FROM transaction_payment WHERE Order_ID = ?
    `, [req.params.id]);
    
    res.json({
      ...orders[0],
      products,
      payments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
      await connection.query(
        'INSERT INTO has (Order_ID, Product_ID, Quantity) VALUES (?, ?, ?)',
        [orderId, item.Product_ID, item.Quantity]
      );
      
      const [[product]] = await connection.query(
        'SELECT Unit_Price FROM product WHERE Product_ID = ?',
        [item.Product_ID]
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

// Sipariş güncelle
router.put('/:id', async (req, res) => {
  try {
    const { Delivery_Date, Due_Date, Payment_Complete } = req.body;
    await pool.query(
      'UPDATE `order` SET Delivery_Date=?, Due_Date=?, Payment_Complete=? WHERE Order_ID=?',
      [Delivery_Date, Due_Date, Payment_Complete, req.params.id]
    );
    res.json({ message: 'Sipariş güncellendi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sipariş sil
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM `order` WHERE Order_ID = ?', [req.params.id]);
    res.json({ message: 'Sipariş silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
