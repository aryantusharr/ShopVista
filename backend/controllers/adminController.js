const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Search admin in ADMINS array (isAdmin: true) by email
  const user = await User.findOne({ email, isAdmin: true });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: true,
    role: 'admin',
    token
  });
};

const getAdminDashboard = async (req, res) => {
  const totalOrders = await Order.countDocuments({});
  const paidOrders = await Order.find({ paymentStatus: 'Paid', status: { $ne: 'Cancelled' } });
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const pendingOrders = await Order.countDocuments({ status: { $in: ['Confirmed', 'Processing'] } });
  const totalUsers = await User.countDocuments({ isAdmin: false });
  const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).select('name stock sku');

  // Last 7 days sales
  const now = new Date();
  const dailySales = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    dailySales[dateStr] = 0;
  }
  paidOrders.forEach((order) => {
    const dateStr = order.createdAt.toISOString().slice(0, 10);
    if (dailySales[dateStr] !== undefined) {
      dailySales[dateStr] += order.totalPrice;
    }
  });

  const chartData = Object.keys(dailySales).map((date) => ({
    date,
    revenue: Math.round(dailySales[date] * 100) / 100,
  }));

  res.json({
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    pendingOrders,
    totalUsers,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    chartData,
  });
};

const getAdminOrders = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findOne({ orderId: req.params.id });

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  } else if (status === 'Shipped' && !order.trackingNumber) {
    order.trackingNumber = `TRK-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  }

  await order.save();
  res.json({ message: 'Order status updated', order });
};

const getAdminInventory = async (req, res) => {
  const products = await Product.find({}).sort({ stock: 1 });
  res.json(products);
};

const adjustStock = async (req, res) => {
  const { productId, quantity, reason } = req.body;

  if (!productId || quantity === undefined || !reason) {
    return res.status(400).json({ message: 'Product ID, quantity and reason are required' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  product.stock = Math.max(0, product.stock + Number(quantity));
  await product.save();

  res.json({ message: 'Stock adjusted', product });
};

module.exports = {
  adminLogin,
  getAdminDashboard,
  getAdminOrders,
  updateOrderStatus,
  getAdminInventory,
  adjustStock,
};
