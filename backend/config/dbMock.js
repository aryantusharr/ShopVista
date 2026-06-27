const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Mock data store
const store = {
  User: [],
  Product: [],
  Cart: [],
  Order: [],
  Address: [],
  Wishlist: []
};

// Seed sample products initially so the app works out-of-the-box
const sampleProducts = [
  {
    _id: '6a3c6e42375be23ef08c0ba1',
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
    _id: '6a3c6e42375be23ef08c0ba2',
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
    _id: '6a3c6e42375be23ef08c0ba3',
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
    _id: '6a3c6e42375be23ef08c0ba4',
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
    _id: '6a3c6e42375be23ef08c0ba5',
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
    _id: '6a3c6e42375be23ef08c0ba6',
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
  }
];

store.Product.push(...sampleProducts);

// Pre-seed an Admin account so logging into merchant panel works instantly
const hashedAdminPassword = bcrypt.hashSync('adminpassword', 10);
store.User.push({
  _id: '6a3c6e42375be23ef08c0ba0',
  name: 'Admin User',
  email: 'admin@shopvista.com',
  password: hashedAdminPassword,
  phone: '9999999999',
  isAdmin: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Helper to generate IDs
function makeId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Deep clone helper
function clone(obj) {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
}

// Convert query criteria to JS match function
function matches(item, query) {
  if (!query) return true;
  for (let key in query) {
    let qval = query[key];
    
    // Support regex searching
    if (qval && qval.$regex) {
      const reg = new RegExp(qval.$regex, qval.$options || '');
      if (!reg.test(item[key])) return false;
      continue;
    }
    
    // Support $or
    if (key === '$or') {
      const ok = qval.some(subQuery => matches(item, subQuery));
      if (!ok) return false;
      continue;
    }
    
    // Support price filters like $gte, $lte
    if (qval && (qval.$gte !== undefined || qval.$lte !== undefined || qval.$gt !== undefined || qval.$lt !== undefined)) {
      const val = item[key];
      if (qval.$gte !== undefined && val < qval.$gte) return false;
      if (qval.$lte !== undefined && val > qval.$lte) return false;
      if (qval.$gt !== undefined && val <= qval.$gt) return false;
      if (qval.$lt !== undefined && val >= qval.$lt) return false;
      continue;
    }

    // Support stock filters like $gt
    if (qval && qval.$gt !== undefined) {
      if (item[key] <= qval.$gt) return false;
      continue;
    }

    // Support element arrays comparison (e.g. status: { $in: [...] })
    if (qval && qval.$in) {
      if (!qval.$in.includes(item[key])) return false;
      continue;
    }

    if (qval && qval.$ne) {
      if (item[key] === qval.$ne) return false;
      continue;
    }

    // Standard direct match
    if (item[key]?.toString() !== qval?.toString()) {
      return false;
    }
  }
  return true;
}

// Model document wrapper to simulate Mongoose Document features
class MockDocument {
  constructor(modelName, data) {
    Object.assign(this, clone(data));
    if (!this._id) {
      this._id = makeId();
    }
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();
    
    Object.defineProperty(this, '_modelName', { value: modelName, enumerable: false });
  }

  async save() {
    const list = store[this._modelName];
    
    // If saving user and password is not hashed yet, hash it
    if (this._modelName === 'User' && this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const idx = list.findIndex(x => x._id.toString() === this._id.toString());
    const dataToSave = clone(this);
    
    if (idx > -1) {
      list[idx] = dataToSave;
    } else {
      list.push(dataToSave);
    }
    return this;
  }

  async deleteOne() {
    const list = store[this._modelName];
    const idx = list.findIndex(x => x._id.toString() === this._id.toString());
    if (idx > -1) {
      list.splice(idx, 1);
    }
    return { deletedCount: 1 };
  }

  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
  }

  populate(path, select) {
    // Populate function mock
    if (this._modelName === 'Cart' && path.startsWith('items.product')) {
      this.items = this.items.map(item => {
        const prod = store.Product.find(p => p._id.toString() === (item.product?._id || item.product).toString());
        if (prod) {
          item.product = clone(prod);
        }
        return item;
      });
    }
    if (this._modelName === 'Wishlist' && path === 'products') {
      this.products = this.products.map(id => {
        return store.Product.find(p => p._id.toString() === id.toString()) || id;
      });
    }
    return Promise.resolve(this);
  }
}

// Mock Query chaining implementation (like .sort().populate().limit())
class MockQuery {
  constructor(modelName, list) {
    this._modelName = modelName;
    this._list = list;
  }

  sort(sortOpt) {
    if (Array.isArray(this._list)) {
      if (typeof sortOpt === 'object') {
        const key = Object.keys(sortOpt)[0];
        const direction = sortOpt[key];
        this._list.sort((a, b) => {
          if (a[key] < b[key]) return -1 * direction;
          if (a[key] > b[key]) return 1 * direction;
          return 0;
        });
      }
    }
    return this;
  }

  select() {
    return this;
  }

  limit(num) {
    if (Array.isArray(this._list)) {
      this._list = this._list.slice(0, num);
    }
    return this;
  }

  populate(path) {
    if (Array.isArray(this._list)) {
      this._list.forEach(doc => {
        if (this._modelName === 'Wishlist' && path === 'products') {
          doc.products = doc.products.map(id => {
            return store.Product.find(p => p._id.toString() === id.toString()) || id;
          });
        }
        if (this._modelName === 'Cart' && path.startsWith('items.product')) {
          doc.items = doc.items.map(item => {
            const prod = store.Product.find(p => p._id.toString() === (item.product?._id || item.product).toString());
            if (prod) {
              item.product = clone(prod);
            }
            return item;
          });
        }
      });
    } else if (this._list) {
      // Single item
      const doc = this._list;
      if (this._modelName === 'Wishlist' && path === 'products') {
        doc.products = doc.products.map(id => {
          return store.Product.find(p => p._id.toString() === id.toString()) || id;
        });
      }
      if (this._modelName === 'Cart' && path.startsWith('items.product')) {
        doc.items = doc.items.map(item => {
          const prod = store.Product.find(p => p._id.toString() === (item.product?._id || item.product).toString());
          if (prod) {
            item.product = clone(prod);
          }
          return item;
        });
      }
    }
    return this;
  }

  then(onResolve, onReject) {
    return Promise.resolve(this._list).then(onResolve, onReject);
  }
}

// Mock Model builder
function createMockModel(name) {
  function Model(data) {
    return new MockDocument(name, data);
  }

  Model.find = (query) => {
    const list = store[name].filter(item => matches(item, query)).map(x => new MockDocument(name, x));
    return new MockQuery(name, list);
  };

  Model.findOne = (query) => {
    const item = store[name].find(item => matches(item, query));
    const result = item ? new MockDocument(name, item) : null;
    return new MockQuery(name, result);
  };

  Model.findById = (id) => {
    const item = store[name].find(x => x._id.toString() === id?.toString());
    const result = item ? new MockDocument(name, item) : null;
    return new MockQuery(name, result);
  };

  Model.create = async (data) => {
    const doc = new MockDocument(name, data);
    await doc.save();
    return doc;
  };

  Model.countDocuments = async (query) => {
    const list = store[name].filter(item => matches(item, query));
    return list.length;
  };

  Model.findByIdAndUpdate = async (id, update) => {
    const item = store[name].find(x => x._id.toString() === id?.toString());
    if (!item) return null;
    
    // Simulate mongoose update queries
    if (update.$inc) {
      for (let k in update.$inc) {
        item[k] = (item[k] || 0) + update.$inc[k];
      }
    } else {
      Object.assign(item, update);
    }
    
    const doc = new MockDocument(name, item);
    await doc.save();
    return doc;
  };

  Model.updateMany = async (query, update) => {
    const items = store[name].filter(item => matches(item, query));
    items.forEach(item => {
      Object.assign(item, update);
    });
    return { matchedCount: items.length, modifiedCount: items.length };
  };

  Model.deleteOne = async (query) => {
    const idx = store[name].findIndex(item => matches(item, query));
    if (idx > -1) {
      store[name].splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  };

  Model.deleteMany = async (query) => {
    if (!query || Object.keys(query).length === 0) {
      store[name] = [];
    } else {
      store[name] = store[name].filter(item => !matches(item, query));
    }
    return { deletedCount: store[name].length };
  };

  Model.insertMany = async (arr) => {
    const docs = [];
    for (let data of arr) {
      const doc = new MockDocument(name, data);
      await doc.save();
      docs.push(doc);
    }
    return docs;
  };

  return Model;
}

// Override mongoose connects and model registries
mongoose.connect = () => {
  console.log('MongoDB connection skipped: running in-memory mock database mode.');
  return Promise.resolve();
};

const originalModel = mongoose.model.bind(mongoose);
mongoose.model = (name, schema) => {
  if (store[name]) {
    return createMockModel(name);
  }
  return originalModel(name, schema);
};

// Export store for logging
module.exports = store;
