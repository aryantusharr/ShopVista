const Product = require("../models/Product");

const getProducts = async (req, res) => {
  const { search, category } = req.query;
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (category && category !== "All") {
    filter.category = category;
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};

const seedProducts = async (req, res) => {
  const sampleProducts = [
    {
      name: "Wireless Bluetooth Headphones",
      description:
        "Premium over-ear headphones with active noise cancellation, 40-hour battery life, and crystal-clear sound. Features comfortable memory foam ear cushions and foldable design for easy portability.",
      price: 79.99,
      image: "https://picsum.photos/seed/headphones/640/480",
      category: "Audio",
      stock: 45,
      rating: 4.5,
      numReviews: 128,
    },
    {
      name: "Smart Fitness Watch Pro",
      description:
        "Advanced fitness tracker with heart rate monitoring, GPS tracking, sleep analysis, and 100+ workout modes. Water-resistant to 50m with a stunning AMOLED display.",
      price: 149.99,
      image: "https://picsum.photos/seed/smartwatch/640/480",
      category: "Electronics",
      stock: 30,
      rating: 4.7,
      numReviews: 256,
    },
    {
      name: "Portable Bluetooth Speaker",
      description:
        "Compact waterproof speaker with 360-degree sound, deep bass, and 24-hour playtime. Perfect for outdoor adventures with its rugged, drop-proof design.",
      price: 49.99,
      image: "https://picsum.photos/seed/speaker/640/480",
      category: "Audio",
      stock: 60,
      rating: 4.3,
      numReviews: 89,
    },
    {
      name: "Premium Laptop Backpack",
      description:
        "Sleek, water-resistant backpack with padded 15.6-inch laptop compartment, USB charging port, anti-theft pocket, and ergonomic shoulder straps.",
      price: 39.99,
      image: "https://picsum.photos/seed/backpack/640/480",
      category: "Accessories",
      stock: 80,
      rating: 4.6,
      numReviews: 312,
    },
    {
      name: "Mechanical Gaming Keyboard",
      description:
        "RGB backlit mechanical keyboard with hot-swappable switches, N-key rollover, programmable macros, and aircraft-grade aluminum frame.",
      price: 89.99,
      image: "https://picsum.photos/seed/keyboard/640/480",
      category: "Computing",
      stock: 35,
      rating: 4.8,
      numReviews: 445,
    },
    {
      name: "USB-C Hub Adapter 8-in-1",
      description:
        "Versatile hub with 4K HDMI, 3 USB 3.0 ports, SD/microSD card reader, USB-C PD charging, and Ethernet port. Compatible with all USB-C laptops.",
      price: 29.99,
      image: "https://picsum.photos/seed/usbhub/640/480",
      category: "Accessories",
      stock: 100,
      rating: 4.4,
      numReviews: 178,
    },
    {
      name: "Ergonomic Wireless Mouse",
      description:
        "Vertical ergonomic mouse designed to reduce wrist strain. Features adjustable DPI, silent clicks, and dual Bluetooth/USB connectivity.",
      price: 24.99,
      image: "https://picsum.photos/seed/mouse/640/480",
      category: "Computing",
      stock: 70,
      rating: 4.2,
      numReviews: 95,
    },
    {
      name: "Smart LED Desk Lamp",
      description:
        "Touch-controlled LED lamp with 5 brightness levels, 3 color temperatures, USB charging port, and 60-minute auto-off timer. Eye-care technology reduces strain.",
      price: 44.99,
      image: "https://picsum.photos/seed/desklamp/640/480",
      category: "Lifestyle",
      stock: 50,
      rating: 4.5,
      numReviews: 67,
    },
    {
      name: "Noise Cancelling Earbuds",
      description:
        "True wireless earbuds with hybrid ANC, transparency mode, 8-hour battery life per charge, and wireless charging case. IPX5 water resistant.",
      price: 119.99,
      image: "https://picsum.photos/seed/earbuds/640/480",
      category: "Audio",
      stock: 40,
      rating: 4.6,
      numReviews: 203,
    },
    {
      name: "Power Bank 20000mAh",
      description:
        "High-capacity portable charger with 22.5W fast charging, dual USB-C and USB-A ports, LED display, and pass-through charging. Charges a phone 4+ times.",
      price: 34.99,
      image: "https://picsum.photos/seed/powerbank/640/480",
      category: "Electronics",
      stock: 90,
      rating: 4.4,
      numReviews: 156,
    },
    {
      name: "HD Webcam 1080p",
      description:
        "Full HD webcam with auto-focus, built-in dual microphone, wide-angle lens, and adjustable clip mount. Works with Zoom, Teams, and all major platforms.",
      price: 59.99,
      image: "https://picsum.photos/seed/webcam/640/480",
      category: "Computing",
      stock: 55,
      rating: 4.3,
      numReviews: 134,
    },
    {
      name: "Minimalist Phone Stand",
      description:
        "Adjustable aluminum phone/tablet stand with anti-slip silicone pads, 270-degree rotation, and foldable design. Supports devices from 4 to 13 inches.",
      price: 14.99,
      image: "https://picsum.photos/seed/phonestand/640/480",
      category: "Accessories",
      stock: 120,
      rating: 4.7,
      numReviews: 289,
    },
  ];

  await Product.deleteMany({});
  const products = await Product.insertMany(sampleProducts);
  res.status(201).json({
    message: `${products.length} products seeded successfully`,
    products,
  });
};

module.exports = { getProducts, getProductById, seedProducts };
