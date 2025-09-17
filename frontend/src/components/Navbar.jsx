"use client"

import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"

export default function Navbar() {
  const { token, user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [q, setQ] = useState("")

  const onLogout = async () => {
    await logout()
    navigate("/login")
  }

  const onSearch = async (e) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`/?q=${encodeURIComponent(q.trim())}`)
  }

  const cartCount = Array.isArray(items) ? items.reduce((n, it) => n + (it.quantity || 1), 0) : 0

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 5.07A7.002 7.002 0 0 1 12 19 7.002 7.002 0 0 1 5.07 13H13zM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
            </svg>
          </div>
          <span className="text-2xl font-semibold text-purple-700">EcommGo</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer">
            Home
          </Link>
          <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer">
            Products
          </Link>
          <Link to="/cart" className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer">
            Cart
          </Link>
          <Link to="/profile" className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer">
            Profile
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <form onSubmit={onSearch} className="w-full">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm"
              />
              <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                <svg className="h-5 w-5 text-gray-400 hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <Link to="/cart" className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors cursor-pointer">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {!token ? (
            <>
              <Link to="/login" className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer">
                Sign in
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline">{user?.first_name ? `Hi, ${user.first_name}` : "Profile"}</span>
              </Link>
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-red-600 transition-colors font-medium cursor-pointer"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
