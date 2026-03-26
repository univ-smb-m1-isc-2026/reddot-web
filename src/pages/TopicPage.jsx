import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'

function Message({ msg, user, onReply, onModerate, depth = 0 }) {
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [score, setScore] = useState(msg.score)
  const [userVote, setUserVote] = useState(msg.userVote)
  const hidden = msg.hidden
  const locked = msg.locked

  const isAdmin = user?.role === 'ADMIN'

  const handleReply = async () => {
    try {
      await apiFetch(`/api/messages/${msg.id}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content: replyContent })
      })
      setReplyContent('')
      setShowReply(false)
      onReply()
    } catch {
      alert('Erreur lors de la réponse')
    }
  }

  const handleVote = async (value) => {
    if (!user) return
    try {
      if (userVote === value) {
        await apiFetch(`/api/messages/${msg.id}/vote`, { method: 'DELETE' })
        setScore(prev => prev - value)
        setUserVote(null)
      } else {
        await apiFetch(`/api/messages/${msg.id}/vote`, {
          method: 'POST',
          body: JSON.stringify({ value })
        })
        setScore(prev => prev - (userVote || 0) + value)
        setUserVote(value)
      }
    } catch {
      alert('Erreur lors du vote')
    }
  }

  const handleReport = async () => {
    const reason = prompt('Raison du signalement (optionnel) :')
    if (reason === null) return
    try {
      await apiFetch(`/api/messages/${msg.id}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      })
      alert('Message signalé !')
    } catch {
      alert('Erreur lors du signalement')
    }
  }

  const handleModerate = async (field, value) => {
    try {
      await apiFetch(`/api/admin/messages/${msg.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: value })
      })
      onReply()
    } catch {
      alert('Erreur lors de la modération')
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-reddot-800 pl-4' : ''}`}>
      <div className={`rounded-xl border p-4 mb-2 transition ${
        hidden
          ? 'border-dashed border-reddot-800 bg-reddot-950 opacity-60'
          : 'bg-reddot-900 border-reddot-800'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-reddot-red flex items-center justify-center text-xs font-bold shrink-0">
            {msg.author[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium">{msg.author}</span>
          {hidden && <span className="text-xs text-reddot-muted">(caché)</span>}
          {locked && <span className="text-xs text-reddot-muted">🔒</span>}
          <span className="text-xs text-reddot-muted ml-auto">
            {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>

        <p className="text-sm text-reddot-text mb-3">{msg.content}</p>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-reddot-800 rounded-lg px-2 py-1">
            <button
              onClick={() => handleVote(1)}
              disabled={!user || locked}
              className={`text-xs transition disabled:opacity-30 ${userVote === 1 ? 'text-green-400' : 'text-reddot-muted hover:text-green-400'}`}
            >▲</button>
            <span className={`text-xs font-bold mx-1 ${score > 0 ? 'text-green-400' : score < 0 ? 'text-reddot-red-light' : 'text-reddot-muted'}`}>
              {score}
            </span>
            <button
              onClick={() => handleVote(-1)}
              disabled={!user || locked}
              className={`text-xs transition disabled:opacity-30 ${userVote === -1 ? 'text-reddot-red-light' : 'text-reddot-muted hover:text-reddot-red-light'}`}
            >▼</button>
          </div>

          {user && !locked && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-xs text-reddot-muted hover:text-reddot-text transition"
            >
              Répondre
            </button>
          )}

          {user && !isAdmin && (
            <button
              onClick={handleReport}
              className="text-xs text-reddot-muted hover:text-reddot-red-light transition"
            >
              Signaler
            </button>
          )}

          {isAdmin && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => handleModerate('hidden', !hidden)}
                className={`text-xs px-2 py-1 rounded-lg border transition ${
                  hidden
                    ? 'border-reddot-red text-reddot-red-light hover:bg-reddot-red hover:text-reddot-text'
                    : 'border-reddot-800 text-reddot-muted hover:border-reddot-red hover:text-reddot-text'
                }`}
              >
                {hidden ? 'Afficher' : 'Cacher'}
              </button>
              <button
                onClick={() => handleModerate('locked', !locked)}
                className={`text-xs px-2 py-1 rounded-lg border transition ${
                  locked
                    ? 'border-reddot-red text-reddot-red-light hover:bg-reddot-red hover:text-reddot-text'
                    : 'border-reddot-800 text-reddot-muted hover:border-reddot-red hover:text-reddot-text'
                }`}
              >
                {locked ? 'Déverrouiller' : 'Verrouiller'}
              </button>
            </div>
          )}
        </div>

        {showReply && (
          <div className="mt-3 space-y-2">
            <textarea
              className="w-full bg-reddot-800 rounded-lg px-3 py-2 text-sm text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red resize-none"
              placeholder="Votre réponse..."
              rows={2}
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                className="bg-reddot-red hover:bg-reddot-red-light transition px-3 py-1 rounded-lg text-xs font-bold"
              >
                Envoyer
              </button>
              <button
                onClick={() => setShowReply(false)}
                className="text-xs text-reddot-muted hover:text-reddot-text transition px-3 py-1"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {msg.replies && msg.replies.map(reply => (
        <Message key={reply.id} msg={reply} user={user} onReply={onReply} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function TopicPage() {
  const { id } = useParams()
  const [topic, setTopic] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const { user } = useAuth()

  const fetchTopic = async () => {
    try {
      const data = await apiFetch(`/api/topics/${id}`)
      setTopic(data)
    } catch {
      setTopic(null)
    }
  }

  const fetchMessages = async () => {
    try {
      const data = await apiFetch(`/api/topics/${id}/messages`)
      setMessages(data)
    } catch {
      setMessages([])
    }
  }

  useEffect(() => {
    fetchTopic()
    fetchMessages()
  }, [id])

  const handlePost = async () => {
    try {
      await apiFetch(`/api/topics/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: newMessage })
      })
      setNewMessage('')
      fetchMessages()
    } catch {
      alert('Erreur lors de l\'envoi')
    }
  }

  if (!topic) return <p className="text-reddot-muted">Chargement...</p>

  return (
    <div>
      <div className="bg-reddot-900 rounded-2xl border border-reddot-800 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black mb-2">{topic.title}</h1>
            {topic.description && (
              <p className="text-reddot-muted text-sm mb-3">{topic.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-reddot-muted">
              <span>par {topic.author}</span>
              <span>{topic.views} vues</span>
              <span>{new Date(topic.createdAt).toLocaleDateString('fr-FR')}</span>
              {topic.locked && <span className="text-reddot-red-light">🔒 Verrouillé</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {messages.length === 0 ? (
          <p className="text-reddot-muted text-sm">Aucun message pour l'instant</p>
        ) : (
          messages.map(msg => (
            <Message key={msg.id} msg={msg} user={user} onReply={fetchMessages} />
          ))
        )}
      </div>

      {user && !topic.locked && (
        <div className="bg-reddot-900 rounded-2xl border border-reddot-800 p-4 space-y-3">
          <textarea
            className="w-full bg-reddot-800 rounded-lg px-4 py-2 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red resize-none text-sm"
            placeholder="Écrire un message..."
            rows={3}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button
            onClick={handlePost}
            className="bg-reddot-red hover:bg-reddot-red-light transition px-4 py-2 rounded-lg text-sm font-bold"
          >
            Envoyer
          </button>
        </div>
      )}

      {!user && (
        <p className="text-reddot-muted text-sm text-center">
          <a href="/login" className="text-reddot-red-light hover:underline">Connectez-vous</a> pour participer
        </p>
      )}
    </div>
  )
}