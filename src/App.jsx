import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
  fetch('/api/hello')
    .then(res => {
      if (!res.ok) throw new Error()
      return res.text()
    })
    .then(data => {
      setMessage(data)
      setLoading(false)
    })
    .catch(() => {
      setError(true)
      setLoading(false)
    })
}, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-6">

        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600"></div>
          <h1 className="text-5xl font-black text-white tracking-tight">
            red<span className="text-red-600">dot</span>
          </h1>
        </div>

        <p className="text-gray-400 text-lg">Le forum qui ne dort jamais</p>

        <div className="mt-8 px-8 py-6 bg-gray-900 rounded-2xl border border-red-900 max-w-md mx-auto">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Message depuis la BDD</p>
          {loading && (
            <p className="text-gray-400 animate-pulse">Connexion à l'API...</p>
          )}
          {error && (
            <p className="text-red-400">Impossible de contacter l'API</p>
          )}
          {message && (
            <p className="text-red-400 font-mono text-lg">{message}</p>
          )}
        </div>

      </div>
    </div>
  )
}

export default App