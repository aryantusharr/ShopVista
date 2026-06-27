const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
  const { shippingAddress, shippingMethod = 'Standard', paymentMethod = 'Card' } = req.body;

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
    return res.status(400).json({ message: 'Complete shipping address is required' });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // Validate stock for each item
  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      return res.status(400).json({ message: 'A product in your cart no longer exists' });
    }
    if (item.quantity > product.stock) {
      return res.status(400).json({
        message: `Not enough stock for "${product.name}". Only ${product.stock} available.`,
      });
    }
  }

  // Build order items and calculate total
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.image,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let shippingCharge = 0;
  if (shippingMethod === 'Express') shippingCharge = 99;
  if (shippingMethod === 'NextDay') shippingCharge = 199;

  const totalPrice = Math.round((subtotal + shippingCharge) * 100) / 100;

  // Generate simple order ID
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderId = `ORD-${dateStr}-${randomStr}`;

  const order = await Order.create({
    orderId,
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    shippingMethod,
    shippingCharge,
    paymentMethod,
    paymentStatus: 'Paid',
    totalPrice,
    status: 'Confirmed',
  });

  // Deduct stock and clear cart
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
  const order = await Order.findOne({ orderId: req.params.id });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }
  res.json(order);
};

const cancelOrder = async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.id, user: req.user._id });

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status !== 'Confirmed' && order.status !== 'Processing') {
    return res.status(400).json({ message: 'Order cannot be cancelled after it has shipped' });
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  order.status = 'Cancelled';
  await order.save();

  res.json({ message: 'Order cancelled successfully', order });
};

const returnOrder = async (req, res) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({ message: 'Reason is required' });
  }

  const order = await Order.findOne({ orderId: req.params.id, user: req.user._id });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status !== 'Delivered') {
    return res.status(400).json({ message: 'Only delivered orders can be returned' });
  }

  // Check 7-day window
  const diffDays = Math.ceil((Date.now() - new Date(order.updatedAt)) / (1000 * 60 * 60 * 24));
  if (diffDays > 7) {
    return res.status(400).json({ message: 'Returns are only accepted within 7 days of delivery' });
  }

  order.status = 'Cancelled';
  order.refundReason = `Return: ${reason}`;
  await order.save();

  res.json({ message: 'Return initiated successfully', order });
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  returnOrder,
};
