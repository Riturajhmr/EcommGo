import api from '../lib/api'

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export const logout = async () => {
  const { data } = await api.post('/auth/logout')
  return data
}

export const getProfile = async () => {
  const { data } = await api.get('/user/profile')
  return data
}

export const updateProfile = async (payload) => {
  const { data } = await api.put('/user/profile', payload)
  return data
}


