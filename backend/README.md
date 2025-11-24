# E-Commerce Backend API - Go/Gin

This is the Go + Gin version of the e-commerce backend API.

## Prerequisites

- Go 1.21 or higher
- MongoDB (local or remote)

## Setup

1. Install dependencies:
```bash
go mod download
```

2. Create a `.env` file (or copy from `.env.example`):
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/ecomm
SECRET_LOVE=your-secret-key-here
RAZORPAY_KEY=rzp_test_key
```

3. Run the server:
```bash
go run main.go
```

Or build and run:
```bash
go build -o server main.go
./server
```

## API Endpoints

### Auth (Public)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Products (Public)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?name=query` - Search products

### Cart (Protected)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Checkout (Protected)
- `POST /api/checkout` - Process checkout

### User (Protected)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Address (Protected)
- `GET /api/address` - Get user addresses
- `POST /api/address` - Add address
- `PUT /api/address/:id` - Update address
- `DELETE /api/address/:id` - Delete address

### Orders (Protected)
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

### Payment (Protected - Mock)
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/:id` - Get payment status

## Authentication

All protected routes require a JWT token in the `token` header or `Authorization: Bearer <token>` header.

## Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/    # Request handlers
├── middleware/      # Middleware (auth, etc.)
├── models/          # Data models
├── routes/          # Route definitions
├── utils/           # Utility functions (token, etc.)
├── main.go          # Application entry point
└── go.mod           # Go module file
```

