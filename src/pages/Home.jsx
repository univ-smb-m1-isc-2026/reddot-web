import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Topics</h1>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-reddot-red hover:bg-reddot-red-light transition px-4 py-2 rounded-lg text-sm font-bold"
          >
            + Nouveau topic
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-reddot-900 rounded-2xl border border-reddot-800 p-6 mb-6 space-y-3">
          <input
            className="w-full bg-reddot-800 rounded-lg px-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red"
            placeholder="Titre du topic"
            value={newTopic.title}
            onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
          />
          <textarea
            className="w-full bg-reddot-800 rounded-lg px-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red resize-none"
            placeholder="Description (optionnel)"
            rows={3}
            value={newTopic.description}
            onChange={e => setNewTopic({ ...newTopic, description: e.target.value })}
          />
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="bg-reddot-red hover:bg-reddot-red-light transition px-4 py-2 rounded-lg text-sm font-bold"
            >
              Créer
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-reddot-muted hover:text-reddot-text transition text-sm px-4 py-2"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <input
          className="flex-1 bg-reddot-900 border border-reddot-800 rounded-lg px-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red text-sm"
          placeholder="Rechercher un topic..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          onClick={() => setSort('recent')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${sort === 'recent' ? 'bg-reddot-red text-reddot-text' : 'bg-reddot-900 border border-reddot-800 text-reddot-muted hover:text-reddot-text'}`}
        >
          Récents
        </button>
        <button
          onClick={() => setSort('popular')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${sort === 'popular' ? 'bg-reddot-red text-reddot-text' : 'bg-reddot-900 border border-reddot-800 text-reddot-muted hover:text-reddot-text'}`}
        >
          Populaires
        </button>
      </div>

      {loading ? (
        <p className="text-reddot-muted text-sm animate-pulse">Chargement...</p>
      ) : topics.length === 0 ? (
        <p className="text-reddot-muted text-sm">Aucun topic pour l'instant</p>
      ) : (
        <div className="space-y-3">
          {topics.map(topic => (
            <div
              key={topic.id}
              onClick={() => navigate(`/topics/${topic.id}`)}
              className="bg-reddot-900 border border-reddot-800 rounded-2xl p-5 cursor-pointer hover:border-reddot-red transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-reddot-text mb-1">{topic.title}</h2>
                  {topic.description && (
                    <p className="text-reddot-muted text-sm line-clamp-2">{topic.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {topic.locked && <span className="text-xs bg-reddot-800 text-reddot-muted px-2 py-0.5 rounded">🔒</span>}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-reddot-muted">
                <span>par {topic.author}</span>
                <span>{topic.views} vues</span>
                <span>{new Date(topic.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}