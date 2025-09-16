import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchProductById } from '../services/productAPI'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add, instantBuy } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedTab, setSelectedTab] = useState('description')

  useEffect(() => {
    if (id) {
      fetchProductById(id)
        .then((data) => {
          setProduct(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching product:', error)
          setLoading(false)
        })
    }
  }, [id])

  const handleAddToCart = async () => {
    try {
      await add({ product_id: product.product_id, quantity: qty })
      alert('Product added to cart successfully!')
    } catch (error) {
      alert('Failed to add product to cart: ' + error.message)
    }
  }

  const handleInstantBuy = async () => {
    try {
      await instantBuy(product.product_id, qty)
      navigate('/checkout')
    } catch (error) {
      alert('Failed to prepare instant buy: ' + error.message)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === (product.images?.length || 1) - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (product.images?.length || 1) - 1 : prev - 1
    )
  }

  const goToImage = (index) => {
    setCurrentImageIndex(index)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <button 
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const images = product.images || [product.image || 'https://via.placeholder.com/600x400?text=Product+Image']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Product */}
      <section className="relative bg-gradient-to-br from-purple-900 via-red-900 to-blue-900 overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        {/* Product Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Product Images */}
            <div className="relative">
              {/* Main Product Image */}
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-purple-600 rounded-3xl opacity-20 blur-3xl"></div>
                <div className="relative bg-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl overflow-hidden">
                  <img 
                    src={images[currentImageIndex]} 
                    alt={product.product_name}
                    className="w-full h-96 object-cover rounded-2xl"
                  />
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {images.length > 1 && (
                <div className="flex justify-center gap-3 mt-6">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'border-purple-500 scale-110' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.product_name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Product Info */}
            <div className="space-y-8">
              <div className="space-y-6">
                {/* Category Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full">
                  <span className="text-purple-300 text-sm font-medium">{product.category}</span>
                </div>

                {/* Product Title */}
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-pink-300 via-white to-purple-300 bg-clip-text text-transparent">
                    {product.product_name}
                  </span>
                </h1>

                {/* Rating and Feature */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-6 h-6 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-gray-600'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-white text-lg font-semibold">{product.rating}/5</span>
                  </div>
                  <div className="text-purple-300 text-lg font-medium">
                    ✨ {product.feature}
                  </div>
                </div>

                {/* Price */}
                <div className="text-6xl font-bold text-white">
                  ${product.price}
                </div>

                {/* Description */}
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  {product.description}
                </p>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <label className="text-white text-lg font-medium">Quantity:</label>
                  <div className="flex items-center border border-gray-600 rounded-lg bg-gray-800/50">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-12 h-12 text-white hover:bg-gray-700 rounded-l-lg transition-colors flex items-center justify-center"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-16 h-12 text-white text-lg font-semibold flex items-center justify-center bg-transparent">
                      {qty}
                    </span>
                    <button 
                      onClick={() => setQty(qty + 1)}
                      className="w-12 h-12 text-white hover:bg-gray-700 rounded-r-lg transition-colors flex items-center justify-center"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    Add to Cart
                  </button>
                  <button
                    onClick={handleInstantBuy}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Instant Buy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex bg-gray-100 rounded-2xl p-2">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                    selectedTab === tab
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {selectedTab === 'description' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                  Product Description
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p className="text-xl leading-relaxed">
                    {product.detailed_description || product.description}
                  </p>
                </div>
              </div>
            )}

            {selectedTab === 'specifications' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                  Technical Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.specifications ? (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <dt className="text-sm font-medium text-gray-500 mb-2">{key}</dt>
                        <dd className="text-lg font-semibold text-gray-900">{value}</dd>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-gray-500 py-12">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg">Specifications not available for this product</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                  Customer Reviews
                </h2>
                <div className="text-center text-gray-500 py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg">No reviews yet for this product</p>
                  <p className="text-sm text-gray-400 mt-2">Be the first to share your experience!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder for related products */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">More Products</h3>
              <p className="text-gray-600 text-sm">Discover our complete collection</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


