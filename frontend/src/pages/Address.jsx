import { useState, useEffect } from 'react'
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../services/addressAPI'
import { useAuth } from '../context/AuthContext'

export default function Address() {
  const { user } = useAuth()
  const [form, setForm] = useState({ house_name: '', street_name: '', city_name: '', pin_code: '' })
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Fetch addresses on component mount
  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses()
      setAddresses(data)
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const resetForm = () => {
    setForm({ house_name: '', street_name: '', city_name: '', pin_code: '' })
    setEditingId(null)
  }

  const onAdd = async () => {
    if (!form.house_name || !form.street_name || !form.city_name || !form.pin_code) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      await addAddress(form)
      alert('Address added successfully!')
      resetForm()
      fetchAddresses()
    } catch (error) {
      alert('Failed to add address: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const onUpdate = async () => {
    if (!editingId) return

    if (!form.house_name || !form.street_name || !form.city_name || !form.pin_code) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      await updateAddress(editingId, form)
      alert('Address updated successfully!')
      resetForm()
      fetchAddresses()
    } catch (error) {
      alert('Failed to update address: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      await deleteAddress(addressId)
      alert('Address deleted successfully!')
      fetchAddresses()
    } catch (error) {
      alert('Failed to delete address: ' + error.message)
    }
  }

  const startEdit = (address) => {
    setForm({
      house_name: address.house_name || address.House || '',
      street_name: address.street_name || address.Street || '',
      city_name: address.city_name || address.City || '',
      pin_code: address.pin_code || address.Pincode || ''
    })
    setEditingId(address.Address_id || address._id)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Addresses</h1>
      
      {/* Address Form */}
      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-medium">
          {editingId ? 'Edit Address' : 'Add New Address'}
        </h2>
        <p className="text-sm text-gray-600">
          {editingId ? 'Update your address details below.' : 'Fill in the details to add a new address.'}
        </p>
        <input 
          className="w-full border rounded p-2" 
          placeholder="House/Flat Number" 
          value={form.house_name} 
          onChange={(e) => setForm({...form, house_name: e.target.value})} 
        />
        <input 
          className="w-full border rounded p-2" 
          placeholder="Street Address" 
          value={form.street_name} 
          onChange={(e) => setForm({...form, street_name: e.target.value})} 
        />
        <input 
          className="w-full border rounded p-2" 
          placeholder="City" 
          value={form.city_name} 
          onChange={(e) => setForm({...form, city_name: e.target.value})} 
        />
        <input 
          className="w-full border rounded p-2" 
          placeholder="PIN Code" 
          value={form.pin_code} 
          onChange={(e) => setForm({...form, pin_code: e.target.value})} 
        />
        <div className="flex gap-2">
          {editingId ? (
            <>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded" 
                disabled={loading} 
                onClick={onUpdate}
              >
                {loading ? 'Updating...' : 'Update Address'}
              </button>
              <button 
                className="border px-4 py-2 rounded" 
                onClick={resetForm}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              className="bg-black text-white px-4 py-2 rounded" 
              disabled={loading} 
              onClick={onAdd}
            >
              {loading ? 'Adding...' : 'Add Address'}
            </button>
          )}
        </div>
      </div>

      {/* Address List */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-medium mb-4">Your Addresses ({addresses.length})</h2>
        {addresses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No addresses found. Add your first address above.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((address, index) => (
              <div key={address.Address_id || address._id || index} className="border rounded p-3 flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{address.house_name || address.House || 'N/A'}</p>
                  <p className="text-gray-600">{address.street_name || address.Street || 'N/A'}</p>
                  <p className="text-gray-600">{address.city_name || address.City || 'N/A'} - {address.pin_code || address.Pincode || 'N/A'}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button 
                    className="text-blue-600 hover:text-blue-800 px-2 py-1"
                    onClick={() => startEdit(address)}
                  >
                    Edit
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800 px-2 py-1"
                    onClick={() => onDelete(address.Address_id || address._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


