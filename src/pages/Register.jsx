import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(null)
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      login(data)
      navigate('/')
    } catch {
      setError('Erreur lors de la création du compte')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-black mb-8">Créer un compte</h1>
      <div className="bg-reddot-900 rounded-2xl border border-reddot-800 p-6 space-y-3">
        <input
          className="w-full bg-reddot-800 rounded-lg px-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red"
          placeholder="Nom d'utilisateur"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="w-full bg-reddot-800 rounded-lg px-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
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
          S'inscrire
        </button>
        {error && <p className="text-reddot-red-light text-sm">{error}</p>}
        <p className="text-reddot-muted text-sm text-center">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-reddot-red-light hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}