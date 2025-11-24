# E-Commerce Shopping Cart Application

Full-stack e-commerce shopping cart application built for Vibe Commerce internship assignment.

## 🚀 Tech Stack

- **Frontend:** React + Vite
- **Backend:** Go + Gin
- **Database:** MongoDB (via Go MongoDB Driver)
- **Authentication:** JWT

## 📋 Assignment Requirements

### Backend APIs ✅

- ✅ `GET /api/products` - Returns 5-10 mock products
- ✅ `POST /api/cart` - Add item to cart with `{productId, qty}`
- ✅ `DELETE /api/cart/:id` - Remove item from cart
- ✅ `GET /api/cart` - Get cart items + total
- ✅ `POST /api/checkout` - Mock checkout returning `{total, timestamp}`

### Frontend Features ✅

- ✅ Products grid with "Add to Cart" button
- ✅ Cart view showing items, quantities, and total
- ✅ Remove and update quantity buttons
- ✅ Checkout form
- ✅ Responsive design

## 📁 Project Structure

```
EcommGo/
├── backend/               # Go/Gin Backend
│   ├── main.go           # Main server file (Port 8080)
│   ├── controllers/      # API controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
│   ├── config/           # Database configuration
│   └── utils/            # Utility functions
│
└── frontend/              # React Frontend
    ├── src/
    │   ├── components/    # React components (ProductCard, ReceiptModal, etc.)
    │   ├── pages/         # Page components (Home, Cart, SimpleCheckout, etc.)
    │   ├── services/      # API service files
    │   └── context/       # React contexts (Auth, Cart)
```

## 🛠️ Setup Instructions

### Prerequisites

- Go 1.21 or higher
- MongoDB (running locally or connection string)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
go mod download
```

3. Create `.env` file:
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/ecomm
SECRET_LOVE=your-secret-key-here
RAZORPAY_KEY=rzp_test_key
```

4. Start the server:
```bash
go run main.go
```

Or build and run:
```bash
go build -o server main.go
./server
```

Backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or Vite default port)

## 🧪 Testing

### Test Assignment Requirements

1. **Get Products:**
```bash
curl http://localhost:8080/api/products
```

2. **Register User:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@example.com","password":"password123","phone":"+1234567890"}'
```

3. **Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

4. **Add to Cart:**
```bash
curl -X POST http://localhost:8080/api/cart \
  -H "Content-Type: application/json" \
  -H "token: YOUR_JWT_TOKEN" \
  -d '{"productId":"PRODUCT_ID","qty":1}'
```

5. **Get Cart:**
```bash
curl http://localhost:8080/api/cart \
  -H "token: YOUR_JWT_TOKEN"
```

6. **Checkout:**
```bash
curl -X POST http://localhost:8080/api/checkout \
  -H "Content-Type: application/json" \
  -H "token: YOUR_JWT_TOKEN" \
  -d '{"cartItems":[]}'
```

## 📚 API Documentation

### Authentication

All protected routes require a JWT token in the request header:
```
token: <your-jwt-token>
```

### Endpoints

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?name=query` - Search products

#### Cart
- `GET /api/cart` - Get user's cart with total
- `POST /api/cart` - Add item: `{productId, qty}`
- `PUT /api/cart/items/:id` - Update quantity: `{quantity}`
- `DELETE /api/cart/:id` - Remove item
- `DELETE /api/cart` - Clear cart

#### Checkout
- `POST /api/checkout` - Process checkout
  - Returns: `{total, timestamp, order_id, items}`

#### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

#### Address
- `GET /api/address` - Get addresses
- `POST /api/address` - Add address
- `PUT /api/address/:id` - Update address
- `DELETE /api/address/:id` - Delete address

#### Orders
- `GET /api/orders` - Get order history
- `GET /api/orders/:id` - Get order by ID

## 🎯 Features

- ✅ User authentication (JWT)
- ✅ Product browsing
- ✅ Shopping cart management
- ✅ Mock checkout with receipt
- ✅ Order history
- ✅ Address management
- ✅ Responsive design

## 📝 Notes

- Backend automatically seeds 8 mock products if database is empty
- Cart operations are user-specific (requires authentication)
- Checkout creates an order and clears the cart
- All timestamps are in ISO 8601 format

## 📄 License

ISC

---

**Built for Vibe Commerce Internship Assignment**

