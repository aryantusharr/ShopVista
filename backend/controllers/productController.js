const Product = require('../models/Product');

const getProducts = async (req, res) => {
  const { search, category, minPrice, maxPrice, inStock, sort } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'priceAsc') sortOption = { price: 1 };
  else if (sort === 'priceDesc') sortOption = { price: -1 };
  else if (sort === 'rating') sortOption = { rating: -1 };
  else if (sort === 'popularity') sortOption = { numReviews: -1 };

  const products = await Product.find(filter).sort(sortOption);
  res.json(products);
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const similarProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .sort({ rating: -1 })
    .limit(4);

  res.json({ product, similarProducts });
};

const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required' });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user && r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({ message: 'You already reviewed this product' });
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ message: 'Review added', product });
};

const createProduct = async (req, res) => {
  const { name, price, stock, category, description, image, images, sku, specs } = req.body;

  if (!name || !price || !category || !description || !image || !sku) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }

  const product = await Product.create({
    name,
    price,
    stock: stock || 0,
    category,
    description,
    image,
    images: images || [image],
    sku,
    specs: specs || {},
  });

  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { name, price, stock, category, description, image, images, specs } = req.body;

  if (name) product.name = name;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (category) product.category = category;
  if (description) product.description = description;
  if (image) product.image = image;
  if (images) product.images = images;
  if (specs) product.specs = specs;

  await product.save();
  res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await product.deleteOne();
  res.json({ message: 'Product deleted' });
};

const seedProducts = async (req, res) => {
  const sampleProducts = [
    {
      name: 'Wireless Bluetooth Headphones',
      sku: 'SKU-HEADPHONES-001',
      description: 'Premium over-ear headphones with active noise cancellation, 40-hour battery life, and crystal-clear sound.',
      price: 79.99,
      image: 'https://picsum.photos/seed/headphones/640/480',
      images: ['https://picsum.photos/seed/headphones/640/480', 'https://picsum.photos/seed/headphones-g1/640/480'],
      category: 'Audio',
      stock: 45,
      rating: 4.5,
      numReviews: 2,
      reviews: [
        { name: 'Amit Sharma', rating: 5, comment: 'Amazing sound quality! Very comfortable.' },
        { name: 'Rohan Patel', rating: 4, comment: 'Good battery life, noise cancellation is decent.' },
      ],
    },
    {
      name: 'Smart Fitness Watch Pro',
      sku: 'SKU-WATCH-002',
      description: 'Advanced fitness tracker with heart rate monitoring, GPS tracking, and 100+ workout modes.',
      price: 149.99,
      image: 'https://picsum.photos/seed/smartwatch/640/480',
      images: ['https://picsum.photos/seed/smartwatch/640/480'],
      category: 'Electronics',
      stock: 30,
      rating: 4.7,
      numReviews: 1,
      reviews: [{ name: 'Sara Khan', rating: 5, comment: 'Best fitness tracker I have owned.' }],
    },
    {
      name: 'Portable Bluetooth Speaker',
      sku: 'SKU-SPEAKER-003',
      description: 'Compact waterproof speaker with 360-degree sound and 24-hour playtime.',
      price: 49.99,
      image: 'https://picsum.photos/seed/speaker/640/480',
      images: ['https://picsum.photos/seed/speaker/640/480'],
      category: 'Audio',
      stock: 60,
      rating: 4.3,
      numReviews: 0,
      reviews: [],
    },
    {
      name: 'Premium Laptop Backpack',
      sku: 'SKU-BACKPACK-004',
      description: 'Sleek water-resistant backpack with padded 15.6-inch laptop compartment and USB charging port.',
      price: 39.99,
      image: 'https://picsum.photos/seed/backpack/640/480',
      images: ['https://picsum.photos/seed/backpack/640/480'],
      category: 'Accessories',
      stock: 8,
      rating: 4.6,
      numReviews: 0,
      reviews: [],
    },
    {
      name: 'Mechanical Gaming Keyboard',
      sku: 'SKU-KEYBOARD-005',
      description: 'RGB backlit mechanical keyboard with hot-swappable switches and N-key rollover.',
      price: 89.99,
      image: 'https://picsum.photos/seed/keyboard/640/480',
      images: ['https://picsum.photos/seed/keyboard/640/480'],
      category: 'Computing',
      stock: 35,
      rating: 4.8,
      numReviews: 0,
      reviews: [],
    },
    {
      name: 'Ergonomic Wireless Mouse',
      sku: 'SKU-MOUSE-006',
      description: 'Vertical ergonomic mouse designed to reduce wrist strain with adjustable DPI.',
      price: 24.99,
      image: 'https://picsum.photos/seed/mouse/640/480',
      images: ['https://picsum.photos/seed/mouse/640/480'],
      category: 'Computing',
      stock: 0,
      rating: 4.2,
      numReviews: 0,
      reviews: [],
    },
  ];

  await Product.deleteMany({});
  const products = await Product.insertMany(sampleProducts);
  res.status(201).json({ message: `${products.length} products seeded`, products });
};

module.exports = {
  getProducts,
  getProductById,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
};
