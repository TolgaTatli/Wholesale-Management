import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Tüm tedarikçileri getir
router.get('/', async (req, res) => {
  try {
    const [suppliers] = await pool.query('SELECT * FROM supplier ORDER BY Supplier_ID DESC');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tek tedarikçi getir
router.get('/:id', async (req, res) => {
  try {
    const [suppliers] = await pool.query('SELECT * FROM supplier WHERE Supplier_ID = ?', [req.params.id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ error: 'Tedarikçi bulunamadı' });
    }
    res.json(suppliers[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni tedarikçi ekle
router.post('/', async (req, res) => {
  try {
    const { Name, Contact_Person, Address, Payment_Terms } = req.body;
    const [result] = await pool.query(
      'INSERT INTO supplier (Name, Contact_Person, Address, Payment_Terms) VALUES (?, ?, ?, ?)',
      [Name, Contact_Person, Address, Payment_Terms]
    );
    res.status(201).json({ 
      message: 'Tedarikçi eklendi',
      Supplier_ID: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tedarikçi güncelle
router.put('/:id', async (req, res) => {
  try {
    const { Name, Contact_Person, Address, Payment_Terms } = req.body;
    await pool.query(
      'UPDATE supplier SET Name=?, Contact_Person=?, Address=?, Payment_Terms=? WHERE Supplier_ID=?',
      [Name, Contact_Person, Address, Payment_Terms, req.params.id]
    );
    res.json({ message: 'Tedarikçi güncellendi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tedarikçi sil
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM supplier WHERE Supplier_ID = ?', [req.params.id]);
    res.json({ message: 'Tedarikçi silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
