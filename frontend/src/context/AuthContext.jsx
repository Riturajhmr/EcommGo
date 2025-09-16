import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getProfile } from '../services/authAPI'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    // Only try to get profile if we don't already have user data
    if (!user) {
      getProfile()
        .then(setUser)
        .catch(() => {/* ignore profile load errors */})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token, user])

  useEffect(() => {
    console.log('AuthContext token changed:', token, 'length:', token?.length)
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  // Add debugging for user state changes
  useEffect(() => {
    console.log('AuthContext user changed:', user)
  }, [user])

  const value = useMemo(() => ({
    token,
    user,
    loading,
    async register(payload) {
      const res = await apiRegister(payload)
      return res
    },
    async login(payload) {
      console.log('Login attempt with payload:', payload)
      const res = await apiLogin(payload)
      console.log('Login response:', res)
      console.log('Response keys:', res ? Object.keys(res) : 'No response')
      
      if (res?.token) { // Backend returns 'token' (lowercase)
        console.log('Setting token:', res.token)
        setToken(res.token)
        console.log('setToken called with:', res.token)
      } else {
        console.log('No Token found in response')
        console.log('Available fields:', Object.keys(res || {}))
        console.log('Token field value:', res?.token)
      }
      
      if (res) {
        console.log('Setting user:', res)
        setUser(res)
        console.log('setUser called with:', res)
        const uid = res.user_id // Backend returns 'user_id' (lowercase)
        if (uid) {
          console.log('Setting user_id:', uid)
          localStorage.setItem('user_id', uid)
        } else {
          console.log('No User_ID found in response')
          console.log('User ID field value:', res?.user_id)
        }
      }
      return res
    },
    async logout() {
      console.log('Logout started, clearing state...')
      console.log('Before logout - localStorage contents:', {
        token: localStorage.getItem('token'),
        user_id: localStorage.getItem('user_id'),
        user: localStorage.getItem('user'),
        auth: localStorage.getItem('auth'),
        cart: localStorage.getItem('cart')
      })
      
      try { await apiLogout() } catch {}
      setToken('')
      setUser(null)
      
      // Clear all user-related data from localStorage
      localStorage.removeItem('user_id')
      localStorage.removeItem('token')
      localStorage.removeItem('cart')
      localStorage.removeItem('user')
      localStorage.removeItem('auth')
      
      // Also try to clear any other potential keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('user') || key.includes('auth') || key.includes('token') || key.includes('cart'))) {
          localStorage.removeItem(key)
        }
      }
      
      // Also clear sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('user') || key.includes('auth') || key.includes('token') || key.includes('cart'))) {
          sessionStorage.removeItem(key)
        }
      }
      
      // Clear cookies that might contain auth data
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('After logout - localStorage contents:', {
        token: localStorage.getItem('token'),
        user_id: localStorage.getItem('user_id'),
        user: localStorage.getItem('user'),
        auth: localStorage.getItem('auth'),
        cart: localStorage.getItem('cart')
      })
      
      console.log('LocalStorage cleared, dispatching logout event...')
      // Dispatch custom event to notify other contexts to clear their state
      window.dispatchEvent(new CustomEvent('userLogout'))
      console.log('Logout completed')
    },
  }), [token, user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


