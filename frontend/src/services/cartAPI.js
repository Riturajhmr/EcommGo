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
  console.log('addToCart API called with:', { product_id, quantity })
  try {
    const { data } = await api.post('/cart/add', { product_id, quantity })
    console.log('addToCart API response:', data)
    return data
  } catch (error) {
    console.error('addToCart API error:', error)
    console.error('Error response:', error.response?.data)
    throw error
  }
}

export const updateCartItem = async ({ id, quantity }) => {
  console.log('updateCartItem API called with:', { id, quantity })
  try {
    const { data } = await api.put(`/cart/items/${id}`, { quantity })
    console.log('updateCartItem API response:', data)
    return data
  } catch (error) {
    console.error('updateCartItem API error:', error)
    console.error('Error response:', error.response?.data)
    throw error
  }
}

export const removeCartItem = async (id) => {
  console.log('removeCartItem API called with:', { id })
  try {
    const { data } = await api.delete(`/cart/items/${id}`)
    console.log('removeCartItem API response:', data)
    return data
  } catch (error) {
    console.error('removeCartItem API error:', error)
    console.error('Error response:', error.response?.data)
    throw error
  }
}

export const clearCart = async () => {
  const { data } = await api.delete('/cart')
  return data
}


