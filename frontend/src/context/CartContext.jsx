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
      
      try {
        console.log('Calling addToCart API with:', { product_id, quantity })
        const result = await addToCart({ product_id, quantity })
        console.log('AddToCart API result:', result)
        
        console.log('Fetching updated cart...')
        const data = await getCart()
        console.log('Updated cart data:', data)
        setItems(Array.isArray(data?.items) ? data.items : [])
        console.log('Cart items updated:', Array.isArray(data?.items) ? data.items : [])
      } catch (error) {
        console.error('Error in add to cart:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        throw error
      }
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
      console.log('CartContext update called with:', { id, quantity, token, tokenLength: token?.length })
      if (!token) {
        throw new Error('User not authenticated')
      }
      
      try {
        console.log('Calling updateCartItem API with:', { id, quantity })
        const result = await updateCartItem({ id, quantity })
        console.log('UpdateCartItem API result:', result)
        
        console.log('Fetching updated cart...')
        const data = await getCart()
        console.log('Updated cart data:', data)
        setItems(Array.isArray(data?.items) ? data.items : [])
        console.log('Cart items updated:', Array.isArray(data?.items) ? data.items : [])
      } catch (error) {
        console.error('Error in update cart item:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        throw error
      }
    },
    async remove(id) {
      console.log('CartContext remove called with:', { id, token, tokenLength: token?.length })
      if (!token) {
        throw new Error('User not authenticated')
      }
      
      try {
        console.log('Calling removeCartItem API with:', { id })
        const result = await removeCartItem(id)
        console.log('RemoveCartItem API result:', result)
        
        console.log('Fetching updated cart...')
        const data = await getCart()
        console.log('Updated cart data:', data)
        setItems(Array.isArray(data?.items) ? data.items : [])
        console.log('Cart items updated:', Array.isArray(data?.items) ? data.items : [])
      } catch (error) {
        console.error('Error in remove cart item:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        throw error
      }
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


