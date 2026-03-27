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

  if (loading) return <p className="text-reddot-muted animate-pulse text-sm">Chargement...</p>
  if (!profile) return <p className="text-reddot-muted text-sm">Utilisateur introuvable</p>

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">

      {/* Profile card */}
      <div className="bg-reddot-900 rounded-2xl border border-reddot-800 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-reddot-red flex items-center justify-center text-2xl font-black text-reddot-text ring-4 ring-reddot-800 shrink-0">
              {profile.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black tracking-tight">{profile.username}</h1>
                {profile.role === 'ADMIN' && (
                  <span className="text-xs bg-reddot-red text-reddot-text px-2.5 py-0.5 rounded-full font-semibold shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-reddot-muted text-sm mt-0.5">
                Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-reddot-muted">
                <span>{profile.topics?.length ?? 0} topic{profile.topics?.length !== 1 ? 's' : ''}</span>
                <span className="text-reddot-800">·</span>
                <span>{profile.messages?.length ?? 0} message{profile.messages?.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {user?.username === username && (
          <div className="px-6 py-3 border-t border-reddot-800 bg-reddot-950/40">
            <button
              onClick={handleDeleteAccount}
              className="text-xs text-reddot-muted hover:text-reddot-red-light transition"
            >
              Supprimer mon compte
            </button>
          </div>
        )}
      </div>

      {/* Topics */}
      {profile.topics && profile.topics.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-reddot-muted uppercase tracking-wider mb-3 px-1">Topics créés</h2>
          <div className="space-y-2">
            {profile.topics.map((topic, i) => (
              <Link
                key={topic.id}
                to={`/topics/${topic.id}`}
                style={{ animationDelay: `${i * 40}ms` }}
                className="flex items-center justify-between gap-4 bg-reddot-900 border border-reddot-800 rounded-2xl px-5 py-3.5 hover:border-reddot-red hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 group animate-fade-in"
              >
                <p className="font-medium text-sm group-hover:text-white transition truncate">{topic.title}</p>
                <span className="text-xs text-reddot-muted shrink-0">{topic.views} vues</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {profile.messages && profile.messages.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-reddot-muted uppercase tracking-wider mb-3 px-1">Messages récents</h2>
          <div className="space-y-2">
            {profile.messages.map((msg, i) => (
              <div
                key={msg.id}
                style={{ animationDelay: `${i * 40}ms` }}
                className="bg-reddot-900 border border-reddot-800 rounded-2xl px-5 py-3.5 animate-fade-in"
              >
                <p className="text-sm text-reddot-text leading-relaxed line-clamp-2">{msg.content}</p>
                <p className="text-xs text-reddot-muted mt-2">
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
