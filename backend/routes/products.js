import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Tüm ürünleri getir
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, s.Name as Supplier_Name 
      FROM product p 
      LEFT JOIN supplier s ON p.Supplier_ID = s.Supplier_ID
      ORDER BY p.Product_ID DESC
    `);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tek ürün getir
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT p.*, s.Name as Supplier_Name FROM product p LEFT JOIN supplier s ON p.Supplier_ID = s.Supplier_ID WHERE p.Product_ID = ?',
      [req.params.id]
    );
    if (products.length === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    res.json(products[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni ürün ekle
router.post('/', async (req, res) => {
  try {
    const { Name, Current_Quantity, Unit_Price, Reorder_Point, Supplier_ID } = req.body;
    const [result] = await pool.query(
      'INSERT INTO product (Name, Current_Quantity, Unit_Price, Reorder_Point, Supplier_ID) VALUES (?, ?, ?, ?, ?)',
      [Name, Current_Quantity, Unit_Price, Reorder_Point, Supplier_ID]
    );
    res.status(201).json({ 
      message: 'Ürün eklendi',
      Product_ID: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün güncelle
router.put('/:id', async (req, res) => {
  try {
    const { Name, Current_Quantity, Unit_Price, Reorder_Point, Supplier_ID } = req.body;
    await pool.query(
      'UPDATE product SET Name=?, Current_Quantity=?, Unit_Price=?, Reorder_Point=?, Supplier_ID=? WHERE Product_ID=?',
      [Name, Current_Quantity, Unit_Price, Reorder_Point, Supplier_ID, req.params.id]
    );
    res.json({ message: 'Ürün güncellendi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ürün sil
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM product WHERE Product_ID = ?', [req.params.id]);
    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
