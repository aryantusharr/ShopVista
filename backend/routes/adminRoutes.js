const express = require('express');
const {
  adminLogin,
  getAdminDashboard,
  getAdminOrders,
  updateOrderStatus,
  getAdminInventory,
  adjustStock,
} = require('../controllers/adminController');
const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public admin login route
router.post('/login', adminLogin);

router.use(protect);
router.use(admin);

router.get('/dashboard', getAdminDashboard);
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/inventory', getAdminInventory);
router.post('/inventory/adjust', adjustStock);

// Product management (admin only)
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
