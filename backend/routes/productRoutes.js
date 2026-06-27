const express = require('express');
const { getProducts, getProductById, createProductReview, seedProducts } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/seed', seedProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
