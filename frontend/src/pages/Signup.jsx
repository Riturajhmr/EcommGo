import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      console.error('Registration error:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create account'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign up</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input className="flex-1 border rounded p-2" placeholder="First name" value={form.first_name} onChange={(e)=>setForm({...form, first_name: e.target.value})} />
          <input className="flex-1 border rounded p-2" placeholder="Last name" value={form.last_name} onChange={(e)=>setForm({...form, last_name: e.target.value})} />
        </div>
        <input className="w-full border rounded p-2" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} />
        <input className="w-full border rounded p-2" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">{loading ? 'Creating...' : 'Create account'}</button>
      </form>
      <p className="text-sm text-slate-600 mt-3">Have an account? <Link to="/login" className="underline">Login</Link></p>
    </div>
  )
}


