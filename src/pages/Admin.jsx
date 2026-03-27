import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'
import { formatDate } from '../utils/date'

function Toggle({ value, onToggle, labelOn, labelOff }) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition border ${
        value
          ? 'bg-reddot-red border-reddot-red text-reddot-text'
          : 'bg-reddot-900 border-reddot-800 text-reddot-muted hover:border-reddot-red hover:text-reddot-text'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-reddot-text' : 'bg-reddot-muted'}`} />
      {value ? labelOn : labelOff}
    </button>
  )
}

function ReportCard({ report, onResolve, onUnresolve, onToggle, onToggleResolved, resolved }) {
  return (
    <div className={`bg-reddot-800/50 border border-reddot-800 rounded-2xl overflow-hidden transition ${resolved ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-reddot-800/60 flex-wrap">
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold shrink-0 ${
          report.targetType === 'TOPIC'
            ? 'bg-reddot-red text-reddot-text'
            : 'bg-reddot-900 text-reddot-muted border border-reddot-800'
        }`}>
          {report.targetType}
        </span>
        <span className="text-xs text-reddot-muted">signalé par <span className="text-reddot-text font-medium">{report.reporter}</span></span>
        {resolved && <span className="text-xs text-green-400 font-medium">Résolu</span>}
        <span className="text-xs text-reddot-muted ml-auto tabular-nums">
          {formatDate(report.createdAt)}
        </span>
      </div>

      {/* Content preview */}
      <div className="px-4 py-3">
        {report.reason && (
          <p className="text-xs text-reddot-muted italic mb-3 leading-relaxed">"{report.reason}"</p>
        )}

        <div className="bg-reddot-950 rounded-xl p-3.5 border border-reddot-800/60">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-reddot-red flex items-center justify-center text-[10px] font-bold shrink-0">
              {report.targetAuthor?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs font-medium text-reddot-text">{report.targetAuthor}</span>
            {report.targetType === 'MESSAGE' && report.targetScore !== null && (
              <span className={`text-xs font-bold tabular-nums ${
                report.targetScore > 0 ? 'text-green-400' :
                report.targetScore < 0 ? 'text-reddot-red-light' : 'text-reddot-muted'
              }`}>
                {report.targetScore > 0 ? '+' : ''}{report.targetScore}
              </span>
            )}
            <Link
              to={report.targetType === 'TOPIC'
                ? `/topics/${report.targetId}`
                : `/topics/${report.targetTopicId}`}
              className="text-xs text-reddot-red-light hover:underline"
            >
            Voir →
          </Link>
          </div>
          <p className="text-sm text-reddot-text leading-relaxed line-clamp-3">
            {report.targetContent || '(pas de contenu)'}
          </p>
          {(report.targetHidden || report.targetLocked) && (
            <div className="flex items-center gap-2 mt-2">
              {report.targetHidden && <span className="text-xs text-reddot-muted bg-reddot-800 px-2 py-0.5 rounded-full">caché</span>}
              {report.targetLocked && <span className="text-xs text-reddot-muted bg-reddot-800 px-2 py-0.5 rounded-full">🔒 verrouillé</span>}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-reddot-800/60 flex-wrap">
        <Toggle
          value={report.targetHidden}
          onToggle={() => (resolved ? onToggleResolved : onToggle)(report, 'hidden', !report.targetHidden)}
          labelOn="Caché"
          labelOff="Cacher"
        />
        <Toggle
          value={report.targetLocked}
          onToggle={() => (resolved ? onToggleResolved : onToggle)(report, 'locked', !report.targetLocked)}
          labelOn="Verrouillé"
          labelOff="Verrouiller"
        />
        {!resolved && (
          <button
            onClick={() => onResolve(report.id)}
            className="text-xs bg-reddot-900 border border-reddot-800 hover:bg-green-900/40 hover:border-green-700 hover:text-green-400 transition px-3 py-1 rounded-full text-reddot-muted ml-auto font-medium"
          >
            Résoudre
          </button>
        )}
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

  const tabs = [
    { key: 'pending', label: 'En attente', count: reports.length },
    { key: 'resolved', label: 'Résolus', count: resolvedReports.length },
    { key: 'users', label: 'Utilisateurs', count: null },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">Panel Admin</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-reddot-900 border border-reddot-800 rounded-full p-1 w-fit">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
              tab === key
                ? 'bg-reddot-red text-reddot-text'
                : 'text-reddot-muted hover:text-reddot-text'
            }`}
          >
            {label}
            {count !== null && count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold tabular-nums ${
                tab === key ? 'bg-reddot-text/20 text-reddot-text' : 'bg-reddot-800 text-reddot-muted'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending reports */}
      {tab === 'pending' && (
        <div key="pending" className="space-y-3 animate-fade-in">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-reddot-800/50 border border-reddot-800 rounded-2xl overflow-hidden animate-pulse">
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-reddot-800/60">
                    <div className="h-4 w-14 bg-reddot-800 rounded-full" />
                    <div className="h-3 w-32 bg-reddot-800 rounded-full" />
                    <div className="h-3 w-16 bg-reddot-800 rounded-full ml-auto" />
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="bg-reddot-950 rounded-xl p-3.5 space-y-2">
                      <div className="h-3 bg-reddot-800 rounded-full w-1/4" />
                      <div className="h-3 bg-reddot-800 rounded-full w-full" />
                      <div className="h-3 bg-reddot-800 rounded-full w-2/3" />
                    </div>
                  </div>
                  <div className="flex gap-2 px-4 py-3 border-t border-reddot-800/60">
                    <div className="h-6 w-16 bg-reddot-800 rounded-full" />
                    <div className="h-6 w-20 bg-reddot-800 rounded-full" />
                    <div className="h-6 w-20 bg-reddot-800 rounded-full ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-reddot-muted">
              <p className="text-sm">Aucun signalement en attente.</p>
            </div>
          ) : (
            reports.map((r, i) => (
              <div key={r.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in">
                <ReportCard
                  report={r}
                  onResolve={handleResolve}
                  onToggle={handleToggle}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Resolved reports */}
      {tab === 'resolved' && (
        <div key="resolved" className="space-y-3 animate-fade-in">
          {resolvedReports.length === 0 ? (
            <div className="text-center py-12 text-reddot-muted">
              <p className="text-sm">Aucun signalement résolu.</p>
            </div>
          ) : (
            resolvedReports.map((r, i) => (
              <div key={r.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in">
                <ReportCard
                  report={r}
                  resolved
                  onUnresolve={handleUnresolve}
                  onToggleResolved={handleToggleResolved}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div key="users" className="space-y-3 animate-fade-in">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-reddot-muted text-sm pointer-events-none">⌕</span>
            <input
              className="w-full bg-reddot-900 border border-reddot-800 rounded-full pl-9 pr-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red text-sm"
              placeholder="Rechercher un utilisateur..."
              value={userSearch}
              onChange={e => {
                setUserSearch(e.target.value)
                fetchUsers(e.target.value)
              }}
            />
          </div>

          <div className="space-y-2">
            {users.filter(u => !u.deletedAt).map((u, i) => (
              <div key={u.id} style={{ animationDelay: `${i * 30}ms` }} className="flex items-center gap-3 bg-reddot-900 border border-reddot-800 rounded-2xl px-4 py-3 animate-fade-in">
                <div className="w-9 h-9 rounded-full bg-reddot-red flex items-center justify-center text-sm font-bold shrink-0">
                  {u.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{u.username}</p>
                    {u.role === 'ADMIN' && (
                      <span className="text-xs bg-reddot-red text-reddot-text px-2 py-0.5 rounded-full font-semibold shrink-0">Admin</span>
                    )}
                    {u.deletedAt && (
                      <span className="text-xs text-reddot-muted bg-reddot-800 px-2 py-0.5 rounded-full shrink-0">supprimé</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    to={`/profile/${u.username}`}
                    className="text-xs text-reddot-muted hover:text-reddot-text transition px-3 py-1.5 rounded-full border border-reddot-800 hover:border-reddot-red"
                  >
                    Profil
                  </Link>
                  {!u.deletedAt && u.username !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u.username)}
                      className="text-xs text-reddot-muted hover:text-reddot-red-light transition px-3 py-1.5 rounded-full border border-reddot-800 hover:border-reddot-red"
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
