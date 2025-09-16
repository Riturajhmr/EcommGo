import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../services/cartAPI'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { token, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Only fetch cart when user is authenticated
  useEffect(() => {
    if (token && user) {
      setLoading(true)
      getCart().then((data) => {
        console.log('Cart data received:', data)
        setItems(Array.isArray(data?.items) ? data.items : [])
      }).catch((error) => {
        console.error('Error fetching cart:', error)
        setItems([])
      }).finally(() => setLoading(false))
    } else {
      // User not authenticated, clear cart
      setItems([])
      setLoading(false)
    }
  }, [token, user])

  // Listen for logout event to clear cart
  useEffect(() => {
    const handleLogout = () => {
      console.log('CartContext received logout event, clearing cart...')
      setItems([])
      setLoading(false)
      console.log('Cart cleared')
    }
    
    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  const value = useMemo(() => ({
    items,
    loading,
    async add({ product_id, quantity = 1 }) {
      console.log('CartContext add called with:', { product_id, quantity, token, tokenLength: token?.length })
      if (!token) {
        console.error('Token is missing or empty:', token)
        throw new Error('User not authenticated')
      }
      await addToCart({ product_id, quantity })
      const data = await getCart()
      setItems(Array.isArray(data?.items) ? data.items : [])
    },
    async instantBuy(product_id, quantity = 1) {
      console.log('CartContext instantBuy called with:', { product_id, quantity, token, tokenLength: token?.length })
      if (!token) {
        console.error('Token is missing or empty:', token)
        throw new Error('User not authenticated')
      }
      // Clear current cart first
      await clearCart()
      // Add only this item
      await addToCart({ product_id, quantity })
      // Fetch updated cart
      const data = await getCart()
      setItems(Array.isArray(data?.items) ? data.items : [])
    },
    async update(id, quantity) {
      if (!token) {
        throw new Error('User not authenticated')
      }
      await updateCartItem({ id, quantity })
      const data = await getCart()
      setItems(Array.isArray(data?.items) ? data.items : [])
    },
    async remove(id) {
      if (!token) {
        throw new Error('User not authenticated')
      }
      await removeCartItem(id)
      const data = await getCart()
      setItems(Array.isArray(data?.items) ? data.items : [])
    },
    async clear() {
      if (!token) {
        throw new Error('User not authenticated')
      }
      await clearCart()
      setItems([])
    },
  }), [items, loading, token])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}


