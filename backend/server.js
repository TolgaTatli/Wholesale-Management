import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import productsRouter from './routes/products.js';
import customersRouter from './routes/customers.js';
import ordersRouter from './routes/orders.js';
import suppliersRouter from './routes/suppliers.js';
import paymentsRouter from './routes/payments.js';
import customerRouter from './routes/customer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/customer', customerRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server çalışıyor!' });
});

// Dashboard istatistikleri
app.get('/api/dashboard', async (req, res) => {
  try {
    const { default: pool } = await import('./config/database.js');
    
    const [[productCount]] = await pool.query('SELECT COUNT(*) as count FROM product');
    const [[customerCount]] = await pool.query('SELECT COUNT(*) as count FROM customer');
    const [[orderCount]] = await pool.query('SELECT COUNT(*) as count FROM `order`');
    const [[totalRevenue]] = await pool.query('SELECT SUM(Total_Amount) as total FROM `order`');
    const [[pendingOrders]] = await pool.query('SELECT COUNT(*) as count FROM `order` WHERE Payment_Complete = 0');
    
    // Düşük stoklu ürünler
    const [lowStock] = await pool.query(`
      SELECT * FROM product 
      WHERE Current_Quantity <= Reorder_Point 
      ORDER BY Current_Quantity ASC 
      LIMIT 5
    `);
    
    res.json({
      products: productCount.count,
      customers: customerCount.count,
      orders: orderCount.count,
      revenue: totalRevenue.total || 0,
      pendingOrders: pendingOrders.count,
      lowStockProducts: lowStock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});
