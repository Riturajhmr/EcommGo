import api from '../lib/api'

export const getCart = async () => {
  // Use modern protected route that uses token to infer user via middleware
  try {
    const { data } = await api.get('/cart')
    return data
  } catch (error) {
    console.error('Error fetching cart:', error)
    return { items: [] }
  }
}

export const addToCart = async ({ product_id, quantity = 1 }) => {
  // Use modern route with proper authentication
  const { data } = await api.post('/cart/add', { product_id, quantity })
  return data
}

export const updateCartItem = async ({ id, quantity }) => {
  const { data } = await api.put(`/cart/items/${id}`, { quantity })
  return data
}

export const removeCartItem = async (id) => {
  const { data } = await api.delete(`/cart/items/${id}`)
  return data
}

export const clearCart = async () => {
  const { data } = await api.delete('/cart')
  return data
}


