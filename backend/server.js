const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('[STARTUP] Initializing ShopVista Server...');

// 1. Conditional Database Mode Setup
const hasDatabaseUri = !!(process.env.MONGODB_URI || process.env.MONGO_URI);
if (!hasDatabaseUri) {
  console.log('[STARTUP] No MONGODB_URI or MONGO_URI environment variables found.');
  console.log('[STARTUP] Activating local in-memory Mock Database mode...');
  require('./config/dbMock');
} else {
  console.log('[STARTUP] MONGODB_URI/MONGO_URI detected. Activating MongoDB client configuration...');
  // Asynchronous non-blocking database connection
  mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    .then(() => {
      console.log('[DATABASE] MongoDB connection established successfully.');
    })
    .catch((err) => {
      console.error('[DATABASE] Async MongoDB connection failure at startup:', err.message);
    });
}

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  next();
});

// 2. CORS Configuration
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
console.log('[STARTUP] CORS middleware configured. Whitelisted origins:', allowedOrigins);

// 3. Load Routes
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
    message: 'ShopVista API is running',
    mode: hasDatabaseUri ? 'MONGODB_PRODUCTION' : 'IN_MEMORY_MOCK',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: hasDatabaseUri 
      ? (mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED')
      : 'MOCK_DATABASE_ACTIVE',
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('[ERROR] Global handler caught exception:', err);
  res.status(500).json({ message: err.message || 'Something went wrong' });
});

// 4. Start Listener
const PORT = process.env.PORT || 5001;
app.listen(PORT, (err) => {
  if (err) {
    console.error('[STARTUP] Failed to bind to port:', err);
    process.exit(1);
  }
  console.log(`[STARTUP] ShopVista Server successfully listening on port ${PORT}`);
});

module.exports = app;
