import api from '../lib/api'

export const fetchProducts = async () => {
  const { data } = await api.get('/products')
  return data
}

export const fetchProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export const searchProducts = async (name) => {
  // Use modern search endpoint
  const { data } = await api.get('/products/search', { params: { name } })
  return data
}


