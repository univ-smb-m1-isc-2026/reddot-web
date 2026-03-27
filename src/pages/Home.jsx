import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'
import { formatDate } from '../utils/date'

export default function Home() {
  const [topics, setTopics] = useState([])
  const [sort, setSort] = useState('recent')
  const [search, setSearch] = useState('')
  const [newTopic, setNewTopic] = useState({ title: '', description: '' })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchTopics = async () => {
    setLoading(true)
    try {
      const endpoint = search
        ? `/api/topics/search?q=${search}&sort=${sort}`
        : `/api/topics?sort=${sort}`
      const data = await apiFetch(endpoint)
      setTopics(data.content)
    } catch {
      setTopics([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTopics() }, [sort, search])

  const handleCreate = async () => {
    try {
      await apiFetch('/api/topics', {
        method: 'POST',
        body: JSON.stringify(newTopic)
      })
      setNewTopic({ title: '', description: '' })
      setShowForm(false)
      fetchTopics()
    } catch {
      alert('Erreur lors de la création du topic')
    }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">Topics</h1>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`text-sm font-bold px-4 py-2 rounded-full transition ${
              showForm
                ? 'bg-reddot-800 text-reddot-text border border-reddot-700'
                : 'bg-reddot-red hover:bg-reddot-red-light'
            }`}
          >
            {showForm ? 'Annuler' : '+ Nouveau topic'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-reddot-900 rounded-2xl border border-reddot-800 overflow-hidden animate-slide-down">
          <div className="px-6 pt-5 pb-4 space-y-3">
            <input
              className="w-full bg-reddot-800 rounded-xl px-4 py-2.5 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red text-sm"
              placeholder="Titre du topic"
              value={newTopic.title}
              onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
            />
            <textarea
              className="w-full bg-reddot-800 rounded-xl px-4 py-2.5 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red resize-none text-sm"
              placeholder="Description (optionnel)"
              rows={2}
              value={newTopic.description}
              onChange={e => setNewTopic({ ...newTopic, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-3 border-t border-reddot-800 bg-reddot-950/40">
            <button
              onClick={handleCreate}
              disabled={!newTopic.title.trim()}
              className="bg-reddot-red hover:bg-reddot-red-light disabled:opacity-40 disabled:cursor-not-allowed transition px-5 py-1.5 rounded-full text-sm font-bold"
            >
              Créer
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-reddot-muted hover:text-reddot-text transition px-3 py-1.5 rounded-full hover:bg-reddot-800"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Search + sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-reddot-muted text-sm pointer-events-none">⌕</span>
          <input
            className="w-full bg-reddot-900 border border-reddot-800 rounded-full pl-9 pr-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red text-sm"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 bg-reddot-900 border border-reddot-800 rounded-full p-1">
          <button
            onClick={() => setSort('recent')}
            className={`px-3.5 py-1 rounded-full text-sm font-medium transition ${
              sort === 'recent' ? 'bg-reddot-red text-reddot-text' : 'text-reddot-muted hover:text-reddot-text'
            }`}
          >
            Récents
          </button>
          <button
            onClick={() => setSort('popular')}
            className={`px-3.5 py-1 rounded-full text-sm font-medium transition ${
              sort === 'popular' ? 'bg-reddot-red text-reddot-text' : 'text-reddot-muted hover:text-reddot-text'
            }`}
          >
            Populaires
          </button>
        </div>
      </div>

      {/* Topics list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-reddot-900 border border-reddot-800 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-reddot-800 rounded-full w-2/3 mb-3" />
              <div className="h-3 bg-reddot-800 rounded-full w-1/3" />
            </div>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 text-reddot-muted">
          <p className="text-sm">{search ? 'Aucun résultat pour cette recherche.' : 'Aucun topic pour l\'instant.'}</p>
        </div>
      ) : (
        <div key={`${sort}-${search}`} className="space-y-2.5">
          {topics.map((topic, i) => (
            <div
              key={topic.id}
              onClick={() => navigate(`/topics/${topic.id}`)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`border rounded-2xl p-5 cursor-pointer transition-all duration-200 group animate-fade-in hover:-translate-y-0.5 active:scale-[0.99] ${
                topic.hidden
                  ? 'bg-reddot-950 border-dashed border-reddot-800 opacity-60 hover:opacity-80'
                  : 'bg-reddot-900 border-reddot-800 hover:border-reddot-red hover:shadow-lg hover:shadow-black/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-bold text-reddot-text group-hover:text-white transition">{topic.title}</h2>
                    {topic.locked && (
                      <span className="text-xs bg-reddot-800 border border-reddot-700 text-reddot-muted px-2 py-0.5 rounded-full shrink-0">🔒</span>
                    )}
                    {topic.hidden && (
                      <span className="text-xs text-reddot-muted italic shrink-0">(caché)</span>
                    )}
                  </div>
                  {topic.description && (
                    <p className="text-reddot-muted text-sm line-clamp-1 leading-relaxed">{topic.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-3 text-xs text-reddot-muted">
                <Link
                  to={`/profile/${topic.author}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 hover:text-reddot-text transition"
                >
                  <div className="w-4 h-4 rounded-full bg-reddot-red flex items-center justify-center text-[9px] font-bold shrink-0">
                    {topic.author[0].toUpperCase()}
                  </div>
                  <span>{topic.author}</span>
                </Link>
                <span className="text-reddot-800 mx-0.5">·</span>
                <span>{topic.views} vues</span>
                <span className="text-reddot-800 mx-0.5">·</span>
                <span>{formatDate(topic.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
