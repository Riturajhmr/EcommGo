import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../services/authAPI'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [originalProfile, setOriginalProfile] = useState(null)

  useEffect(() => {
    getProfile().then((data) => {
      setProfile(data)
      setOriginalProfile(data)
    })
  }, [])

  const validateForm = () => {
    const newErrors = {}
    
    if (!profile.first_name?.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!profile.last_name?.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!profile.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onEdit = () => {
    setIsEditing(true)
    setMessage('')
    setErrors({})
  }

  const onCancel = () => {
    setIsEditing(false)
    setProfile({ ...originalProfile })
    setMessage('')
    setErrors({})
  }

  const onSave = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setMessage('')
    
    try {
      const updateData = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone
      }
      
      const result = await updateProfile(updateData)
      
      if (result && result.message) {
        setMessage('Profile updated successfully!')
        setOriginalProfile({ ...profile })
        setIsEditing(false)
      } else {
        throw new Error('Update response was not successful')
      }
    } catch (error) {
      setMessage('Failed to update profile: ' + (error.response?.data?.error || error.message))
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  )

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
  const username = `@${profile.first_name?.toLowerCase() || 'user'}`
  const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  }) : 'Recently'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header Section */}
      <div className="relative">
        {/* Dark Background with Wavy Shapes */}
        <div className="h-80 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
          {/* Wavy Background Shapes */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-20 right-0 w-96 h-96 bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="relative z-10 -mt-20">
          <div className="max-w-4xl mx-auto px-6">
            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-40 h-40 bg-white rounded-full p-2 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {profile.first_name ? profile.first_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-8">
              <div className="text-gray-500 text-lg mb-2">{username}</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{fullName}</h1>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-6">
                <span className="text-purple-600 font-medium">EcommGo User</span>
                <div className="w-px h-4 bg-gray-300"></div>
                <span>Joined {joinDate}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 mb-6">
                {!isEditing ? (
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={onCancel}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              {/* Bio */}
              <div className="max-w-2xl mx-auto">
                <p className="text-gray-600 leading-relaxed">
                  {profile.bio || `Welcome to EcommGo! I'm ${fullName}, a valued member of our community. I love exploring amazing products and sharing experiences with fellow shoppers.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Information</h2>
          
          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Profile Form */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                {isEditing ? (
                  <>
                    <input 
                      className={`w-full border rounded-lg p-3 ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                      value={profile.first_name || ''} 
                      onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      placeholder="Enter your first name"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                    )}
                  </>
                ) : (
                  <div className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-900">
                    {profile.first_name || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                {isEditing ? (
                  <>
                    <input 
                      className={`w-full border rounded-lg p-3 ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                      value={profile.last_name || ''} 
                      onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      placeholder="Enter your last name"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                    )}
                  </>
                ) : (
                  <div className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-900">
                    {profile.last_name || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                {isEditing ? (
                  <>
                    <input 
                      className={`w-full border rounded-lg p-3 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                      value={profile.email || ''} 
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      placeholder="Enter your email"
                      type="email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </>
                ) : (
                  <div className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-900">
                    {profile.email || 'Not provided'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    value={profile.phone || ''} 
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="Enter your phone number"
                    type="tel"
                  />
                ) : (
                  <div className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-900">
                    {profile.phone || 'Not provided'}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0-9c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Website</div>
                    <div className="text-gray-900 font-medium">EcommGo.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="text-gray-900 font-medium">{profile.email || 'Not provided'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="text-gray-900 font-medium">{profile.phone || 'Not provided'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Joined</div>
                    <div className="text-gray-900 font-medium">{joinDate}</div>
                  </div>
                </div>
              </div>

              {/* Profile Statistics */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {profile.address ? profile.address.length : 0}
                    </div>
                    <div className="text-sm text-purple-600">Addresses</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile.orders ? profile.orders.length : 0}
                    </div>
                    <div className="text-sm text-blue-600">Orders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


