import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'

function Toggle({ value, onToggle, labelOn, labelOff }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
        value
          ? 'bg-reddot-red border-reddot-red text-reddot-text'
          : 'bg-reddot-900 border-reddot-800 text-reddot-muted hover:border-reddot-red hover:text-reddot-text'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${value ? 'bg-reddot-text' : 'bg-reddot-muted'}`}></span>
      {value ? labelOn : labelOff}
    </button>
  )
}

function ReportCard({ report, onResolve, onUnresolve, onToggle, onToggleResolved, resolved }) {
  return (
    <div className={`bg-reddot-800 rounded-xl p-4 ${resolved ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${
              report.targetType === 'TOPIC'
                ? 'bg-reddot-red text-reddot-text'
                : 'bg-reddot-900 text-reddot-muted border border-reddot-800'
            }`}>
              {report.targetType}
            </span>
            <span className="text-xs text-reddot-muted">par {report.reporter}</span>
            <span className="text-xs text-reddot-muted ml-auto">
              {new Date(report.createdAt).toLocaleDateString('fr-FR')}
            </span>
            {resolved && <span className="text-xs text-green-400">✓ Résolu</span>}
          </div>

          {report.reason && (
            <p className="text-xs text-reddot-muted italic mb-2">"{report.reason}"</p>
          )}

          <div className="bg-reddot-950 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-reddot-text">{report.targetAuthor}</span>
              {report.targetType === 'MESSAGE' && report.targetScore !== null && (
                <span className={`text-xs font-bold ${
                  report.targetScore > 0 ? 'text-green-400' :
                  report.targetScore < 0 ? 'text-reddot-red-light' : 'text-reddot-muted'
                }`}>
                  score : {report.targetScore}
                </span>
              )}
              <Link
                to={`/topics/${report.targetTopicId}`}
                className="text-xs text-reddot-red-light hover:underline ml-auto"
              >
                {report.targetTopicTitle} →
              </Link>
            </div>
            <p className="text-sm text-reddot-text line-clamp-3">
              {report.targetContent || '(pas de contenu)'}
            </p>
            {report.targetHidden && (
              <span className="text-xs text-reddot-muted mt-1 inline-block">👁 Caché</span>
            )}
            {report.targetLocked && (
              <span className="text-xs text-reddot-muted mt-1 inline-block ml-2">🔒 Verrouillé</span>
            )}
          </div>

          {!resolved && (
            <div className="flex items-center gap-2 flex-wrap">
              <Toggle
                value={report.targetHidden}
                onToggle={() => onToggle(report, 'hidden', !report.targetHidden)}
                labelOn="Caché"
                labelOff="Cacher"
              />
              <Toggle
                value={report.targetLocked}
                onToggle={() => onToggle(report, 'locked', !report.targetLocked)}
                labelOn="Verrouillé"
                labelOff="Verrouiller"
              />
              <button
                onClick={() => onResolve(report.id)}
                className="text-xs bg-reddot-900 border border-reddot-800 hover:bg-green-900 hover:border-green-700 hover:text-green-400 transition px-3 py-1.5 rounded-lg text-reddot-muted ml-auto"
              >
                ✓ Résoudre
              </button>
            </div>
          )}

          {resolved && (
            <div className="flex items-center gap-2 flex-wrap">
              <Toggle
                value={report.targetHidden}
                onToggle={() => onToggleResolved(report, 'hidden', !report.targetHidden)}
                labelOn="Caché"
                labelOff="Cacher"
              />
              <Toggle
                value={report.targetLocked}
                onToggle={() => onToggleResolved(report, 'locked', !report.targetLocked)}
                labelOn="Verrouillé"
                labelOff="Verrouiller"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('pending')
  const [reports, setReports] = useState([])
  const [resolvedReports, setResolvedReports] = useState([])
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/')
      return
    }
    fetchReports()
    fetchResolvedReports()
    fetchUsers()
  }, [user])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/admin/reports?resolved=false')
      setReports(data)
    } catch {
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const fetchResolvedReports = async () => {
    try {
      const data = await apiFetch('/api/admin/reports?resolved=true')
      setResolvedReports(data)
    } catch {
      setResolvedReports([])
    }
  }

  const fetchUsers = async (q = '') => {
    try {
      const data = await apiFetch(`/api/admin/users?q=${q}`)
      setUsers(data)
    } catch {
      setUsers([])
    }
  }

  const handleResolve = async (id) => {
    try {
      await apiFetch(`/api/admin/reports/${id}/resolve`, { method: 'PATCH' })
      fetchReports()
      fetchResolvedReports()
    } catch {
      alert('Erreur lors de la résolution')
    }
  }

  const handleToggle = async (report, field, value) => {
    const type = report.targetType === 'TOPIC' ? 'topics' : 'messages'
    try {
      await apiFetch(`/api/admin/${type}/${report.targetId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: value })
      })
      setReports(prev => prev.map(r =>
        r.id === report.id
          ? { ...r, [`target${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }
          : r
      ))
    } catch {
      alert('Erreur lors de la modération')
    }
  }

  const handleUnresolve = async (id) => {
    try {
      await apiFetch(`/api/admin/reports/${id}/unresolve`, { method: 'PATCH' })
      fetchReports()
      fetchResolvedReports()
    } catch {
      alert('Erreur lors de la désolution')
    }
  }

  const handleToggleResolved = async (report, field, value) => {
    const type = report.targetType === 'TOPIC' ? 'topics' : 'messages'
    try {
      await apiFetch(`/api/admin/${type}/${report.targetId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: value })
      })
      setResolvedReports(prev => prev.map(r =>
        r.id === report.id
          ? { ...r, [`target${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }
          : r
      ))
    } catch {
      alert('Erreur lors de la modération')
    }
  }

  const handleDeleteUser = async (username) => {
    if (!confirm(`Supprimer le compte de ${username} ?`)) return
    try {
      await apiFetch(`/api/admin/users/${username}`, { method: 'DELETE' })
      fetchUsers(userSearch)
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Panel Admin</h1>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'pending', label: `Signalements (${reports.length})` },
          { key: 'resolved', label: `Résolus (${resolvedReports.length})` },
          { key: 'users', label: 'Utilisateurs' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === key
                ? 'bg-reddot-red text-reddot-text'
                : 'bg-reddot-900 border border-reddot-800 text-reddot-muted hover:text-reddot-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <div className="bg-reddot-900 rounded-2xl border border-reddot-800 p-6">
          {loading ? (
            <p className="text-reddot-muted animate-pulse text-sm">Chargement...</p>
          ) : reports.length === 0 ? (
            <p className="text-reddot-muted text-sm">Aucun signalement en attente</p>
          ) : (
            <div className="space-y-3">
              {reports.map(r => (
                <ReportCard
                  key={r.id}
                  report={r}
                  onResolve={handleResolve}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'resolved' && (
        <div className="bg-reddot-900 rounded-2xl border border-reddot-800 p-6">
          {resolvedReports.length === 0 ? (
            <p className="text-reddot-muted text-sm">Aucun signalement résolu</p>
          ) : (
            <div className="space-y-3">
              {resolvedReports.map(r => (
                <ReportCard
                  key={r.id}
                  report={r}
                  resolved
                  onUnresolve={handleUnresolve}
                  onToggleResolved={handleToggleResolved}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-reddot-900 rounded-2xl border border-reddot-800 p-6">
          <input
            className="w-full bg-reddot-800 rounded-lg px-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red text-sm mb-4"
            placeholder="Rechercher un utilisateur..."
            value={userSearch}
            onChange={e => {
              setUserSearch(e.target.value)
              fetchUsers(e.target.value)
            }}
          />
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 bg-reddot-800 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-reddot-red flex items-center justify-center text-sm font-bold shrink-0">
                  {u.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{u.username}</p>
                  <p className="text-xs text-reddot-muted">{u.role}</p>
                </div>
                {u.deletedAt && (
                  <span className="text-xs text-reddot-muted">[supprimé]</span>
                )}
                <div className="ml-auto flex gap-2">
                  <Link
                    to={`/profile/${u.username}`}
                    className="text-xs text-reddot-muted hover:text-reddot-text transition px-3 py-1.5 rounded-lg border border-reddot-900 hover:border-reddot-red"
                  >
                    Profil
                  </Link>
                  {!u.deletedAt && u.username !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u.username)}
                      className="text-xs text-reddot-muted hover:text-reddot-red-light transition px-3 py-1.5 rounded-lg border border-reddot-900 hover:border-reddot-red"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}