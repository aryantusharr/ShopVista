const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check email against USERS array (isAdmin: false) only
  const existingUser = await User.findOne({ email, isAdmin: false });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  // Force signup as user only
  const user = await User.create({ name, email, password, phone, isAdmin: false });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: false,
    role: 'user',
    token: generateToken(user._id, 'user'),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Search user in USERS array (isAdmin: false) by email
  const user = await User.findOne({ email, isAdmin: false });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: false,
    role: 'user',
    token: generateToken(user._id, 'user'),
  });
};

const getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    isAdmin: req.user.isAdmin,
    createdAt: req.user.createdAt,
  });
};

const updateProfile = async (req, res) => {
  const { name, phone, password, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (password && newPassword) {
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }
    user.password = newPassword;
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
