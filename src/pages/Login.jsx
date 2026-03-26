import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(null)
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      login(data)
      navigate('/')
    } catch {
      setError('Identifiants incorrects')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-black mb-8">Connexion</h1>
      <div className="bg-reddot-900 rounded-2xl border border-reddot-800 p-6 space-y-3">
        <input
          className="w-full bg-reddot-800 rounded-lg px-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red"
          placeholder="Nom d'utilisateur"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="w-full bg-reddot-800 rounded-lg px-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red"
          placeholder="Mot de passe"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-reddot-red hover:bg-reddot-red-light transition rounded-lg px-4 py-2 font-bold"
        >
          Se connecter
        </button>
        {error && <p className="text-reddot-red-light text-sm">{error}</p>}
        <p className="text-reddot-muted text-sm text-center">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-reddot-red-light hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}