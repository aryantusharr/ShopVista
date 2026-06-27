require('./config/dbMock');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(cors({
  origin: [
    'https://shopvista-wine.vercel.app',
    'https://shop-vista-beta.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'ShopVista API is running in mock database mode' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    database: 'MOCK_DATABASE_ACTIVE',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Something went wrong' });
});

// Start server directly (No MongoDB connection required)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('MongoDB connection bypassed successfully.');
  console.log(`Server running in mock mode on port ${PORT}`);
});

module.exports = app;
