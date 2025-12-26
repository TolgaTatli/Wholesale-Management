import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// 4.2.2 Process Customer Cancellation
router.post('/cancel/:orderId', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const orderId = req.params.orderId;
    
    // 🔒 Validate Cancellation Eligibility - Lock order row
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
    
    // 🔒 Update Product Attributes - Lock and restore stock
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

// 4.2.3 Record Customer Payment
router.post('/payment', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { Order_ID, Amount_Paid, Payment_Date, Payment_Status } = req.body;
    
    // 🔒 Validate Order Association - Lock order row
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
    
    // 🔒 Verify Aggregate Attributes - Calculate total paid (includes new payment)
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

export default router;
