const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  const { shippingAddress } = req.body;

  if (
    !shippingAddress ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.state ||
    !shippingAddress.zipCode
  ) {
    return res.status(400).json({ message: "Complete shipping address is required" });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  for (const item of cart.items) {
    if (!item.product) {
      return res.status(400).json({ message: "A product in your cart no longer exists" });
    }
    if (item.quantity > item.product.stock) {
      return res.status(400).json({
        message: `Only ${item.product.stock} unit${item.product.stock === 1 ? "" : "s"} of "${item.product.name}" available`,
      });
    }
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.image,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    totalPrice: Math.round(totalPrice * 100) / 100,
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  cart.items = [];
  await cart.save();

  res.status(201).json(order);
};

const getOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to view this order" });
  }
  res.json(order);
};

module.exports = { createOrder, getOrders, getOrderById };
