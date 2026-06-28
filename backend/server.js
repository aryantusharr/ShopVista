const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('[STARTUP] Initializing database-free mock ShopVista Server...');

const app = express();

// Timestamped request & response logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// CORS Configuration
const allowedOrigins = [
  'https://shopvista-wine.vercel.app',
  'https://shop-vista-beta.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
console.log('[STARTUP] CORS whitelist initialized:', allowedOrigins);

// Load routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
console.log('[STARTUP] API route handlers mapped successfully.');

app.get('/', (req, res) => {
  res.json({
    message: 'ShopVista API is running in mock database mode',
    database: 'MOCK'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'MOCK',
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('[ERROR] Global handler caught exception:', err);
  res.status(500).json({ message: err.message || 'Something went wrong' });
});

// Start listener
const PORT = process.env.PORT || 5001;
app.listen(PORT, (err) => {
  if (err) {
    console.error('[STARTUP] Failed to bind to port:', err);
    process.exit(1);
  }
  console.log(`[STARTUP] ShopVista Server successfully listening on port ${PORT}`);
});

module.exports = app;
