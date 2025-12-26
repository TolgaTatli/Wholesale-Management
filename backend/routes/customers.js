import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Tüm müşterileri getir
router.get('/', async (req, res) => {
  try {
    const [customers] = await pool.query('SELECT * FROM customer ORDER BY Customer_ID DESC');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Müşteri ve adreslerini getir
router.get('/:id', async (req, res) => {
  try {
    const [customers] = await pool.query('SELECT * FROM customer WHERE Customer_ID = ?', [req.params.id]);
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    const [addresses] = await pool.query('SELECT * FROM customer_loc WHERE Customer_ID = ?', [req.params.id]);
    
    res.json({
      ...customers[0],
      addresses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Müşteri adreslerini getir
router.get('/:id/addresses', async (req, res) => {
  try {
    const [addresses] = await pool.query('SELECT Customer_Address FROM customer_loc WHERE Customer_ID = ?', [req.params.id]);
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni müşteri ekle
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { Name, Phone, Email, addresses } = req.body;
    const [result] = await connection.query(
      'INSERT INTO customer (Name, Phone, Email) VALUES (?, ?, ?)',
      [Name, Phone, Email]
    );
    
    // Adresleri ekle
    if (addresses && addresses.length > 0) {
      for (const address of addresses) {
        await connection.query(
          'INSERT INTO customer_loc (Customer_ID, Customer_Address) VALUES (?, ?)',
          [result.insertId, address]
        );
      }
    }
    
    await connection.commit();
    res.status(201).json({ 
      message: 'Müşteri eklendi',
      Customer_ID: result.insertId 
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Müşteri güncelle
router.put('/:id', async (req, res) => {
  try {
    const { Name, Phone, Email } = req.body;
    await pool.query(
      'UPDATE customer SET Name=?, Phone=?, Email=? WHERE Customer_ID=?',
      [Name, Phone, Email, req.params.id]
    );
    res.json({ message: 'Müşteri güncellendi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Müşteri sil
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // CASCADE nedeniyle customer_loc, order, transaction_payment da silinir
    await connection.query('DELETE FROM customer WHERE Customer_ID = ?', [req.params.id]);
    
    await connection.commit();
    res.json({ message: 'Müşteri silindi' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

export default router;
