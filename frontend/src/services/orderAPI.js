import api from '../lib/api'

export const placeOrder = async (orderData) => {
  // Use the modern /orders endpoint for checkout
  const { data } = await api.post('/orders')
  return data
}

export const instantBuy = async (productId, quantity) => {
  // Use the modern /cart/instantbuy endpoint
  const { data } = await api.post('/cart/instantbuy', { 
    product_id: productId, 
    quantity: quantity 
  })
  return data
}

export const getOrders = async () => {
  const { data } = await api.get('/orders')
  return data
}

export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`)
  return data
}


