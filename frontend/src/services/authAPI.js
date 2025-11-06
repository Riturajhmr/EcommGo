import api from '../lib/api'

export const register = async (payload) => {
  try {
    const { data } = await api.post('/auth/register', payload)
    return data
  } catch (error) {
    console.error('Registration API error:', error.response?.data || error.message)
    throw error
  }
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


