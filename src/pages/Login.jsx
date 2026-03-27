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
    <div className="max-w-sm mx-auto mt-20">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black tracking-tight">Connexion</h1>
        <p className="text-reddot-muted text-sm mt-1">Content de te revoir !</p>
      </div>

      <div className="bg-reddot-900 rounded-2xl border border-reddot-800 overflow-hidden animate-scale-in">
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-reddot-muted uppercase tracking-wider">Nom d'utilisateur</label>
            <input
              className="w-full bg-reddot-800 rounded-xl px-4 py-2.5 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red text-sm"
              placeholder="ex: john_doe"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-reddot-muted uppercase tracking-wider">Mot de passe</label>
            <input
              className="w-full bg-reddot-800 rounded-xl px-4 py-2.5 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red text-sm"
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <div className="bg-reddot-red/10 border border-reddot-red/30 text-reddot-red-light text-sm rounded-xl px-4 py-2.5 animate-slide-down">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!form.username.trim() || !form.password}
            className="w-full bg-reddot-red hover:bg-reddot-red-light disabled:opacity-40 disabled:cursor-not-allowed transition rounded-full px-4 py-2.5 font-bold text-sm"
          >
            Se connecter
          </button>
          <p className="text-reddot-muted text-sm text-center">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-reddot-red-light hover:underline font-medium">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
