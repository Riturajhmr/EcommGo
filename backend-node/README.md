# E-Commerce Backend API - Node/Express

This is the Node/Express backend for the E-Commerce application, built to meet the Vibe Commerce internship assignment requirements.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Assignment Requirements Met

### Backend APIs

✅ **GET /api/products** - Returns 5-10 mock products (id, name, price)
✅ **POST /api/cart** - Add item to cart with `{productId, qty}`
✅ **DELETE /api/cart/:id** - Remove item from cart
✅ **GET /api/cart** - Get cart items + total
✅ **POST /api/checkout** - Mock checkout returning `{total, timestamp}` receipt

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend-node
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/ecomm
SECRET_LOVE=your-secret-key-here-change-in-production
```

5. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:8080`

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register new user
- **POST /api/auth/login** - Login user
- **POST /api/auth/logout** - Logout user

### Products

- **GET /api/products** - Get all products
- **GET /api/products/:id** - Get product by ID
- **GET /api/products/search?name=query** - Search products

### Cart (Protected - requires authentication token)

- **GET /api/cart** - Get user's cart with total
- **POST /api/cart** - Add item to cart
  ```json
  {
    "productId": "product_id_here",
    "qty": 1
  }
  ```
- **DELETE /api/cart/:id** - Remove item from cart

### Checkout (Protected)

- **POST /api/checkout** - Process mock checkout
  ```json
  {
    "cartItems": [...] // Optional, uses user's cart if not provided
  }
  ```
  Returns:
  ```json
  {
    "total": 299.00,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "order_id": "...",
    "items": 3
  }
  ```

## Authentication

All protected routes require a JWT token in the request header:

```
token: <your-jwt-token>
```

Or:

```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

### User
- Stores user information, cart items, addresses, and orders

### Product
- Stores product information

## Error Handling

All errors return JSON in the following format:
```json
{
  "error": "Error message here"
}
```

## Development

The backend uses:
- Express for routing
- Mongoose for MongoDB ODM
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled for frontend integration

## Notes

- The backend automatically seeds 8 mock products if the database is empty
- Cart operations are user-specific (requires authentication)
- Checkout creates an order and clears the cart
- All timestamps are in ISO 8601 format

