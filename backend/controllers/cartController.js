const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price image stock"
  );
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  res.json(cart);
};

const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  const currentQuantity = existingItem ? existingItem.quantity : 0;
  const totalRequested = currentQuantity + quantity;

  if (totalRequested > product.stock) {
    return res.status(400).json({
      message: `Only ${product.stock} item${product.stock === 1 ? "" : "s"} available in stock`,
    });
  }

  if (existingItem) {
    existingItem.quantity = totalRequested;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate("items.product", "name price image stock");
  res.json(cart);
};

const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  const product = await Product.findById(item.product);
  if (product && quantity > product.stock) {
    return res.status(400).json({
      message: `Only ${product.stock} item${product.stock === 1 ? "" : "s"} available in stock`,
    });
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product", "name price image stock");
  res.json(cart);
};

const removeFromCart = async (req, res) => {
  const { itemId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();
  await cart.populate("items.product", "name price image stock");
  res.json(cart);
};

const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ message: "Cart cleared" });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
