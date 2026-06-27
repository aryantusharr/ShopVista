# ShopVista — MERN E-Commerce Application

A clean, full-featured MERN e-commerce platform built with MongoDB, Express, React, and Node.js. Both the customer web app and merchant admin panel are optimized with React and Vite.

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React (Vite), global vanilla CSS              |
| Admin Panel| React (Vite), global vanilla CSS              |
| Backend    | Node.js, Express, Mongoose                    |
| Database   | MongoDB Atlas                                 |
| Auth       | JWT (JSON Web Tokens) + bcryptjs              |

## Folders

- `/backend` - Express API
- `/frontend` - Customer web app (Vite)
- `/admin` - Merchant admin panel (Vite)

## Local Run Instructions

### 1. Database & Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB Atlas URI & JWT_SECRET
npm install
npm start
```
Seed products by calling: `http://localhost:5001/api/products/seed` (GET request).

### 2. Customer Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Runs on `http://localhost:3000`.

### 3. Admin Panel
```bash
cd admin
cp .env.example .env
npm install
npm run dev
```
Runs on `http://localhost:5173`.

## Vercel Deployment Instructions

All 3 projects are ready to be deployed as separate Vercel projects:

1. **`/backend`**: Deploy using `vercel.json` serverless rewrite. Make sure to specify env variables `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL` / `ADMIN_URL` for CORS configuration.
2. **`/frontend`**: Deploy as a static Vite app. Define `VITE_API_URL` pointing to your deployed backend API.
3. **`/admin`**: Deploy as a static Vite app. Define `VITE_API_URL` pointing to your deployed backend API.

## Live Deployed Links (Placeholders)
- **Backend API**: `https://shopvista-api.vercel.app`
- **Customer Web App**: `https://shopvista-store.vercel.app`
- **Admin Dashboard**: `https://shopvista-admin.vercel.app`
