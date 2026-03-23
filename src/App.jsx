import { useState, useEffect } from 'react'

function App() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const fetchUsers = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setUsers([]))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRegister = () => {
    setMessage(null)
    setError(null)
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(() => {
        setMessage('Compte créé avec succès !')
        setForm({ username: '', email: '', password: '' })
        fetchUsers()
      })
      .catch(() => setError('Erreur lors de la création du compte'))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-full bg-red-600"></div>
        <h1 className="text-3xl font-black">red<span className="text-red-600">dot</span></h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Formulaire register */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold mb-4">Créer un compte</h2>

          <div className="space-y-3">
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Nom d'utilisateur"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Mot de passe"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />

            <button
              onClick={handleRegister}
              className="w-full bg-red-600 hover:bg-red-700 transition rounded-lg px-4 py-2 font-bold"
            >
              S'inscrire
            </button>
          </div>

          {message && <p className="mt-3 text-green-400 text-sm">{message}</p>}
          {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
        </div>

        {/* Liste des users */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold mb-4">Utilisateurs inscrits</h2>
          {users.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun utilisateur pour l'instant</p>
          ) : (
            <ul className="space-y-2">
              {users.map(u => (
                <li key={u.id} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2">
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">
                    {u.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm">{u.username}</span>
                  <span className="ml-auto text-xs text-gray-500">{u.role}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}

export default App