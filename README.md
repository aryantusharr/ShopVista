# ShopVista — MERN E-Commerce Application

A full-stack e-commerce platform built with MongoDB, Express, React, and Node.js.

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 19, Tailwind CSS 3, React Router, Axios |
| Backend    | Node.js, Express 5, Mongoose 9                |
| Database   | MongoDB Atlas                                 |
| Auth       | JWT (JSON Web Tokens) + bcrypt                |

## Project Structure

```
ShopVista/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── errorHandler.js       # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   └── orderRoutes.js
│   ├── server.js                 # Entry point
│   ├── .env.example              # Environment template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.js
    │   │   ├── ProductCard.js
    │   │   ├── CartItem.js
    │   │   └── CheckoutForm.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── CartContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── ProductDetail.js
    │   │   ├── CartPage.js
    │   │   ├── Checkout.js
    │   │   ├── Login.js
    │   │   └── Orders.js
    │   ├── api.js                # Axios instance
    │   ├── App.js                # Router + Providers
    │   └── index.js
    ├── tailwind.config.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A MongoDB Atlas account (free tier works)

### 1. Backend Setup

```bash
cd backend

# Create .env file from template
cp .env.example .env

# Edit .env with your values:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shopvista?retryWrites=true&w=majority
# JWT_SECRET=your_secret_here
# PORT=5000

# Start the server
npm run dev
```

### 2. Seed Sample Products

After the backend is running, seed the database with sample products:

```bash
curl -X POST http://localhost:5000/api/products/seed
```

Or open `http://localhost:5000/api/products/seed` in your browser via POST (use Postman or the curl command).

### 3. Frontend Setup

```bash
cd frontend

# Start the React dev server
npm start
```

The frontend runs on `http://localhost:3000` and connects to the backend at `http://localhost:5000`.

## API Endpoints

### Auth
| Method | Endpoint            | Auth | Description       |
|--------|---------------------|------|-------------------|
| POST   | /api/auth/register  | No   | Create account    |
| POST   | /api/auth/login     | No   | Login             |
| GET    | /api/auth/profile   | Yes  | Get user profile  |

### Products
| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| GET    | /api/products         | No   | List all products    |
| GET    | /api/products/:id     | No   | Get single product   |
| POST   | /api/products/seed    | No   | Seed sample products |

### Cart
| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| GET    | /api/cart              | Yes  | Get user's cart      |
| POST   | /api/cart              | Yes  | Add item to cart     |
| PUT    | /api/cart/:itemId      | Yes  | Update item quantity |
| DELETE | /api/cart/:itemId      | Yes  | Remove item          |
| DELETE | /api/cart/clear        | Yes  | Clear entire cart    |

### Orders
| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| POST   | /api/orders            | Yes  | Create order         |
| GET    | /api/orders            | Yes  | Get user's orders    |
| GET    | /api/orders/:id        | Yes  | Get order by ID      |

## Features

- User registration and login with JWT authentication
- Browse products with search and category filtering
- Product detail pages with quantity selector
- Shopping cart with add/remove/update functionality
- Checkout with shipping address form
- Order history with expandable order details
- Responsive design with dark theme
- Toast notifications for user feedback
- Loading states and error handling throughout
