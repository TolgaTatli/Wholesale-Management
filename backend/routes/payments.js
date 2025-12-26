import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Tüm ödemeleri getir
router.get('/', async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT tp.*, o.Order_ID, c.Name as Customer_Name
      FROM transaction_payment tp
      LEFT JOIN \`order\` o ON tp.Order_ID = o.Order_ID
      LEFT JOIN customer c ON o.Customer_ID = c.Customer_ID
      ORDER BY tp.Payment_ID DESC
    `);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ödeme ekle
router.post('/', async (req, res) => {
  try {
    const { Order_ID, Amount_Paid, Payment_Date, Payment_Status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO transaction_payment (Order_ID, Amount_Paid, Payment_Date, Payment_Status) VALUES (?, ?, ?, ?)',
      [Order_ID, Amount_Paid, Payment_Date, Payment_Status]
    );
    res.status(201).json({ 
      message: 'Ödeme kaydedildi',
      Payment_ID: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ödeme güncelle
router.put('/:id', async (req, res) => {
  try {
    const { Payment_Status, Amount_Paid } = req.body;
    await pool.query(
      'UPDATE transaction_payment SET Payment_Status=?, Amount_Paid=? WHERE Payment_ID=?',
      [Payment_Status, Amount_Paid, req.params.id]
    );
    res.json({ message: 'Ödeme güncellendi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
