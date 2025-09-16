import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { placeOrder } from '../services/orderAPI'
import { getAddresses } from '../services/addressAPI'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const { items, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if this is an instant buy (single item)
  const isInstantBuy = items.length === 1

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressData = await getAddresses()
        console.log('Fetched addresses:', addressData) // Debug log
        setAddresses(addressData || [])
        if (addressData && addressData.length > 0) {
          setSelectedAddress(addressData[0])
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
        setAddresses([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAddresses()
    }
  }, [user])

  const total = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0)

  const onPlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select an address')
      return
    }

    setPlacing(true)
    try {
      const result = await placeOrder({
        items: items,
        address: selectedAddress,
        total: total
      })
      console.log('Order result:', result)
      clear()
      alert('Order placed successfully!')
      navigate('/profile') // Redirect to profile/orders
    } catch (error) {
      console.error('Order error:', error)
      alert('Failed to place order: ' + (error.response?.data?.error || error.message))
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <div className="p-6">Loading addresses...</div>

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
        <p className="text-slate-600 mb-4">Your cart is empty.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-black text-white px-4 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        {isInstantBuy ? 'Instant Buy Checkout' : 'Checkout'}
      </h1>
      
      {/* Instant Buy Indicator */}
      {isInstantBuy && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Instant Buy - Single Item Checkout
              </p>
              <p className="text-sm text-green-700 mt-1">
                You're purchasing this item directly without adding it to your cart first.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Cart Items */}
      <div className="border rounded p-4">
        <h2 className="text-lg font-medium mb-3">
          {isInstantBuy ? 'Order Summary' : 'Order Summary'}
        </h2>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={`${item.Product_ID || item.product_id || item._id}-${index}`} className="flex justify-between">
              <span>{item.product_name} x {item.quantity || 1}</span>
              <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Address Selection */}
      <div className="border rounded p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium">Delivery Address</h2>
          <button 
            onClick={() => navigate('/address')} 
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            + Add New Address
          </button>
        </div>
        {addresses.length === 0 ? (
          <div className="text-center">
            <p className="text-slate-600 mb-4">No addresses found. Please add an address first.</p>
            <button 
              onClick={() => navigate('/address')} 
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {addresses.map((address, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                <input
                  type="radio"
                  name="address"
                  value={index}
                  checked={selectedAddress === address}
                  onChange={() => setSelectedAddress(address)}
                  className="mr-2"
                />
                <span>
                  {address.house_name || address.House || 'N/A'}, {address.street_name || address.Street || 'N/A'}, {address.city_name || address.City || 'N/A'} - {address.pin_code || address.Pincode || 'N/A'}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Place Order Button */}
      <button 
        className="bg-black text-white px-6 py-3 rounded-lg w-full font-medium" 
        disabled={placing || addresses.length === 0} 
        onClick={onPlaceOrder}
      >
        {placing ? 'Placing Order...' : (isInstantBuy ? 'Complete Instant Buy' : 'Place Order')}
      </button>
    </div>
  )
}
