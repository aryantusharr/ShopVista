const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getWishlist = async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }
  res.json(wishlist);
};

const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  const index = wishlist.products.indexOf(productId);
  if (index > -1) {
    wishlist.products.splice(index, 1);
    await wishlist.save();
    res.json({ message: "Removed from wishlist", wishlist });
  } else {
    wishlist.products.push(productId);
    await wishlist.save();
    res.json({ message: "Added to wishlist", wishlist });
  }
};

const moveToCart = async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.stock < 1) {
    return res.status(400).json({ message: "Product is out of stock" });
  }

  // Remove from wishlist
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();
  }

  // Add to cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    if (existingItem.quantity + 1 > product.stock) {
      return res.status(400).json({ message: "Cannot add more. Exceeds available stock." });
    }
    existingItem.quantity += 1;
  } else {
    cart.items.push({ product: productId, quantity: 1 });
  }

  await cart.save();
  await cart.populate("items.product", "name price image stock");

  res.json({ message: "Moved to cart", cart, wishlist });
};

module.exports = {
  getWishlist,
  toggleWishlist,
  moveToCart,
};
