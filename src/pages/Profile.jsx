import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => {
    apiFetch(`/api/users/${username}`)
      .then(data => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [username])

  const handleDeleteAccount = async () => {
    if (!confirm('Supprimer définitivement votre compte ?')) return
    try {
      await apiFetch('/api/auth/account', { method: 'DELETE' })
      logout()
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) return <p className="text-reddot-muted animate-pulse">Chargement...</p>
  if (!profile) return <p className="text-reddot-muted">Utilisateur introuvable</p>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-reddot-900 rounded-2xl border border-reddot-800 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-reddot-red flex items-center justify-center text-2xl font-black text-reddot-text">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black">{profile.username}</h1>
            <p className="text-reddot-muted text-sm">
              Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
            </p>
            {profile.role === 'ADMIN' && (
              <span className="text-xs bg-reddot-red text-reddot-text px-2 py-0.5 rounded mt-1 inline-block">
                Admin
              </span>
            )}
          </div>
        </div>

        {user?.username === username && (
          <div className="mt-4 pt-4 border-t border-reddot-800">
            <button
              onClick={handleDeleteAccount}
              className="text-sm text-reddot-muted hover:text-reddot-red-light transition"
            >
              Supprimer mon compte
            </button>
          </div>
        )}
      </div>

      {profile.topics && profile.topics.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Topics créés</h2>
          <div className="space-y-2">
            {profile.topics.map(topic => (
              <Link
                key={topic.id}
                to={`/topics/${topic.id}`}
                className="block bg-reddot-900 border border-reddot-800 rounded-xl p-4 hover:border-reddot-red transition"
              >
                <p className="font-medium text-sm">{topic.title}</p>
                <p className="text-xs text-reddot-muted mt-1">{topic.views} vues</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {profile.messages && profile.messages.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3">Messages récents</h2>
          <div className="space-y-2">
            {profile.messages.map(msg => (
              <div
                key={msg.id}
                className="bg-reddot-900 border border-reddot-800 rounded-xl p-4"
              >
                <p className="text-sm text-reddot-text">{msg.content}</p>
                <p className="text-xs text-reddot-muted mt-1">
                  {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}