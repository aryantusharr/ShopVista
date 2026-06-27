const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name price image stock'
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Check if any item stock changed
  const warnings = [];
  for (const item of cart.items) {
    if (!item.product) {
      warnings.push('An item in your cart is no longer available.');
      continue;
    }
    if (item.product.stock <= 0) {
      warnings.push(`"${item.product.name}" is now out of stock.`);
    } else if (item.quantity > item.product.stock) {
      warnings.push(`"${item.product.name}" quantity reduced to ${item.product.stock} (stock limit).`);
      item.quantity = item.product.stock;
    }
  }

  res.json({ items: cart.items, warnings });
};

const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (product.stock <= 0) {
    return res.status(400).json({ message: 'Product is out of stock' });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  const currentQty = existingItem ? existingItem.quantity : 0;
  const totalWanted = currentQty + Number(quantity);

  if (totalWanted > product.stock) {
    return res.status(400).json({
      message: `Only ${product.stock} units available. You already have ${currentQty} in cart.`,
    });
  }

  if (existingItem) {
    existingItem.quantity = totalWanted;
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity) });
  }

  await cart.save();
  await cart.populate('items.product', 'name price image stock');

  res.json({ items: cart.items, warnings: [] });
};

const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (!quantity || Number(quantity) < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  const product = await Product.findById(item.product);
  if (product && Number(quantity) > product.stock) {
    return res.status(400).json({ message: `Only ${product.stock} units available` });
  }

  item.quantity = Number(quantity);
  await cart.save();
  await cart.populate('items.product', 'name price image stock');

  res.json({ items: cart.items, warnings: [] });
};

const removeFromCart = async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();
  await cart.populate('items.product', 'name price image stock');

  res.json({ items: cart.items, warnings: [] });
};

const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ message: 'Cart cleared' });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
