import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const { add } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  // Handle different product ID field names from backend
  const productId = product.product_id || product._id || product.Product_ID || product.id
  
  // Create a fallback SVG image instead of using placeholder.com
  const fallbackImage = `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle" dy=".3em">
        ${product.product_name || 'Product Image'}
      </text>
    </svg>
  `)}`
  
  // Use fallback if no image, or if image is a placeholder URL
  const hasValidImage = product.image && 
                       product.image.trim() !== '' && 
                       !product.image.includes('via.placeholder.com') &&
                       !product.image.includes('placeholder.com')
  
  const image = hasValidImage ? product.image : fallbackImage

  // Use actual product rating if available, otherwise generate random for demo
  const rating = product.rating || Math.floor(Math.random() * 2) + 4 // Random rating between 4-5
  const reviewCount = Math.floor(Math.random() * 100) + 50 // Random review count between 50-150

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Product Image Section */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        <Link to={`/products/${productId}`} className="block w-full h-full">
          <img 
            src={image} 
            alt={product.product_name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.log('Image failed to load, using fallback')
              e.target.src = fallbackImage
            }}
          />
        </Link>
        
        {/* Wishlist Icon */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200"
        >
          <svg 
            className={`w-4 h-4 transition-colors duration-200 ${
              isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </button>
      </div>

      {/* Product Details Section */}
      <div className="p-5 space-y-3">
        {/* Product Title */}
        <Link to={`/products/${productId}`} className="block">
          <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
            {product.product_name}
          </h3>
        </Link>

        {/* Product Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {product.description || `High-quality ${product.product_name.toLowerCase()} with premium features and modern design`}
        </p>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`w-4 h-4 ${
                  index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-orange-600">
            ${product.price}
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={() => add({ product_id: productId, quantity: 1 })}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}


