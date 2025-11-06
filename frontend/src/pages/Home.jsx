import { useEffect, useState } from 'react'
import { fetchProducts, searchProducts } from '../services/productAPI'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useLocation } from 'react-router-dom'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const { search } = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(search)
    const q = params.get('q')
    const loader = q ? searchProducts(q) : fetchProducts()
    loader
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [search])

  // Featured products for hero section
  const featuredProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      category: "Audio",
      rating: 4.9,
      feature: "Noise Canceling"
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      category: "Wearables",
      rating: 4.8,
      feature: "Heart Rate Monitor"
    },
    {
      id: 3,
      name: "4K Gaming Monitor",
      price: 449,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop",
      category: "Electronics",
      rating: 4.7,
      feature: "144Hz Refresh Rate"
    },
    {
      id: 4,
      name: "Wireless Gaming Mouse",
      price: 89,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
      category: "Gaming",
      rating: 4.6,
      feature: "RGB Lighting"
    },
    {
      id: 5,
      name: "Bluetooth Speaker",
      price: 129,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
      category: "Audio",
      rating: 4.5,
      feature: "Waterproof"
    },
    {
      id: 6,
      name: "Mechanical Keyboard",
      price: 159,
      image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop",
      category: "Gaming",
      rating: 4.4,
      feature: "Cherry MX Switches"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-blue-900 overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-pink-300 via-white to-purple-300 bg-clip-text text-transparent">
                    Experience
                  </span>
                  <br />
                  <span className="text-white">Immersion</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-lg">
                  Discover premium electronics engineered for exceptional performance with superior quality and cutting-edge technology.
                </p>
              </div>
              
              <button className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl">
                Shop Now!
              </button>
            </div>

            {/* Right Side - Featured Product */}
            <div className="relative">
              <div className="relative z-20">
                {/* Main Product Display */}
                <div className="relative w-80 h-80 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
                  <div className="relative bg-gray-900 rounded-full p-8 border border-gray-700 shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop" 
                      alt="Premium Headphones"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyOTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjokgUHJlbWl1bSBIZWFkcGhvbmVzPC90ZXh0Pjwvc3ZnPg==";
                      }}
                    />
                  </div>
                  
                  {/* Feature Callouts */}
                  <div className="absolute -top-4 -right-4 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
                    <div className="text-blue-400 text-sm font-semibold">🔊 Wireless</div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
                    <div className="text-green-400 text-sm font-semibold">⚡ Fast Charging</div>
                  </div>
                </div>

                {/* Feature Card */}
                <div className="absolute bottom-20 right-0 bg-gray-900/80 backdrop-blur-sm border border-gray-600 rounded-xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🎵</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">New Feature</div>
                      <div className="text-white font-semibold">True Adaptive Noise Canceling</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-scrolling Featured Products */}
        <div className="relative z-10 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Featured Products
            </h2>
            
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll space-x-8">
                {[...featuredProducts, ...featuredProducts].map((product, index) => (
                  <div key={`${product.id}-${index}`} className="flex-shrink-0 w-80">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group">
                      <div className="relative mb-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#1f2937"/><text x="50%" y="50%" font-family="Arial" font-size="16" fill="#fff" text-anchor="middle" dy=".3em">${product.name}</text></svg>`)}`;
                          }}
                        />
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          {product.feature}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-white font-bold text-lg">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-gray-300 text-sm">{product.rating}/5</span>
                        </div>
                        <div className="text-2xl font-bold text-white">${product.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info Cards */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Smart Technology Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">🔊</span>
              </div>
              <div className="text-white font-bold text-lg mb-2">Hi-fi Sound</div>
              <div className="text-gray-300">Smart Technology</div>
            </div>

            {/* Rating Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-bold text-orange-400 mb-2">4.9/5⭐</div>
              <div className="text-white font-bold text-lg mb-3">Most Rated Product</div>
              <div className="flex items-center justify-center gap-2 text-orange-400 cursor-pointer hover:text-orange-300 transition-colors">
                <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <span className="text-sm">Want to learn more? Watch video</span>
              </div>
            </div>

            {/* Battery Life Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg className="w-full h-full text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">80</span>
                </div>
              </div>
              <div className="text-white font-bold text-lg mb-2">Extended Battery Life</div>
              <div className="text-gray-300 text-sm">A powerful battery that keeps the music playing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">All Products</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.Product_ID || p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}


