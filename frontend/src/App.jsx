import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './routes/ProtectedRoute'
import Profile from './pages/Profile'
import SimpleCheckout from './pages/SimpleCheckout'
import Address from './pages/Address'
import OrderHistory from './pages/OrderHistory'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><SimpleCheckout /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/address" element={<ProtectedRoute><Address /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
