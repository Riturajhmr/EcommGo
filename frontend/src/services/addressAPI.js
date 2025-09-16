import api from '../lib/api'

// Modern API endpoints
export const getAddresses = async () => {
  const { data } = await api.get('/address')
  return data.addresses || []
}

export const addAddress = async (payload) => {
  const { data } = await api.post('/address', payload)
  return data
}

export const updateAddress = async (addressId, payload) => {
  const { data } = await api.put(`/address/${addressId}`, payload)
  return data
}

export const deleteAddress = async (addressId) => {
  const { data } = await api.delete(`/address/${addressId}`)
  return data
}

// Legacy endpoints (kept for backward compatibility)
export const editHomeAddress = async (payload) => {
  const { data } = await api.put('/edithomeaddress', payload)
  return data
}

export const editWorkAddress = async (payload) => {
  const { data } = await api.put('/editworkaddress', payload)
  return data
}

export const deleteAddresses = async () => {
  const { data } = await api.get('/deleteaddresses')
  return data
}
