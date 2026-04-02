import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { formatDate } from '../utils/date'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'
import MentionTextarea from '../components/MentionTextarea'

function renderContent(content) {
  const parts = content.split(/(@\w+)/g)
  return parts.map((part, i) =>
    /^@\w+$/.test(part)
      ? <Link key={i} to={`/profile/${part.slice(1)}`} className="text-reddot-red-light font-semibold hover:underline">{part}</Link>
      : <span key={i}>{part}</span>
  )
}

function collectParticipants(messages, topicAuthor) {
  const names = new Set()
  if (topicAuthor) names.add(topicAuthor)
  function traverse(msgs) {
    for (const msg of msgs) {
      names.add(msg.author)
      if (msg.replies?.length) traverse(msg.replies)
    }
  }
  traverse(messages)
  return [...names]
}

function Message({ msg, user, onReply, depth = 0, topicLocked, participants }) {
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

  const handleDelete = async () => {
    if (!confirm('Supprimer ce message ? Cette action est irréversible.')) return
    try {
      await apiFetch(`/api/messages/${msg.id}`, { method: 'DELETE' })
      onReply()
    } catch {
      alert('Erreur lors de la suppression')
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
    <div className={depth > 0 ? 'ml-6 pl-4 border-l-2 border-reddot-800/60' : ''}>
      <div className={`rounded-2xl border mb-2.5 transition-all duration-200 ${
        hidden
          ? 'border-dashed border-reddot-800 bg-reddot-950 opacity-60'
          : 'bg-reddot-900 border-reddot-800 hover:border-reddot-700'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-reddot-800/50">
          <div className="flex items-center gap-2.5">
            <Link to={`/profile/${msg.author}`} className="flex items-center gap-2.5 hover:opacity-80 transition">
              <div className="w-7 h-7 rounded-full bg-reddot-red flex items-center justify-center text-xs font-bold shrink-0">
                {msg.author[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold">{msg.author}</span>
            </Link>
            {hidden && (
              <span className="text-xs text-reddot-muted italic bg-reddot-800 px-2 py-0.5 rounded-full">caché</span>
            )}
            {locked && (
              <span className="relative group cursor-default select-none">
                <span className="text-xs bg-reddot-800 border border-reddot-700 px-2 py-0.5 rounded-full text-reddot-muted">🔒</span>
                <span className="absolute bottom-full left-0 mb-2 w-56 text-xs bg-reddot-800 border border-reddot-700 text-reddot-text rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  Ce message a été <span className="text-reddot-red-light font-semibold">verrouillé par un administrateur</span>.
                </span>
              </span>
            )}
          </div>
          <span className="text-xs text-reddot-muted tabular-nums">
            {formatDate(msg.createdAt)}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm text-reddot-text leading-relaxed px-4 py-3.5">{renderContent(msg.content)}</p>

        {/* Actions */}
        <div className="flex items-center gap-2.5 px-4 pb-3 pt-2 border-t border-reddot-800/50 flex-wrap">
          <div className="flex items-center gap-1 bg-reddot-800/80 rounded-full px-3 py-1">
            <button
              onClick={() => handleVote(1)}
              disabled={!user || locked || topicLocked}
              className={`text-xs transition disabled:opacity-30 ${userVote === 1 ? 'text-green-400' : 'text-reddot-muted hover:text-green-400'}`}
            >▲</button>
            <span className={`text-xs font-bold px-1 tabular-nums ${score > 0 ? 'text-green-400' : score < 0 ? 'text-reddot-red-light' : 'text-reddot-muted'}`}>
              {score}
            </span>
            <button
              onClick={() => handleVote(-1)}
              disabled={!user || locked || topicLocked}
              className={`text-xs transition disabled:opacity-30 ${userVote === -1 ? 'text-reddot-red-light' : 'text-reddot-muted hover:text-reddot-red-light'}`}
            >▼</button>
          </div>

          {user && !locked && !topicLocked && (
            <button
              onClick={() => setShowReply(!showReply)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                showReply
                  ? 'bg-reddot-800 text-reddot-text'
                  : 'text-reddot-muted hover:text-reddot-text hover:bg-reddot-800/70'
              }`}
            >
              Répondre
            </button>
          )}

          {user && !isAdmin && (
            <div className="flex items-center gap-2 ml-auto">
              {user.username === msg.author && (
                <button
                  onClick={handleDelete}
                  className="text-xs text-reddot-muted hover:text-reddot-red-light transition"
                >
                  Supprimer
                </button>
              )}
              <button
                onClick={handleReport}
                className="text-xs text-reddot-muted hover:text-reddot-red-light transition"
              >
                Signaler
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handleDelete}
                className="text-xs text-reddot-muted hover:text-reddot-red-light transition"
              >
                Supprimer
              </button>
              <button
                onClick={() => handleModerate('hidden', !hidden)}
                className={`text-xs px-2.5 py-1 rounded-full border transition font-medium ${
                  hidden
                    ? 'border-reddot-red text-reddot-red-light hover:bg-reddot-red hover:text-reddot-text'
                    : 'border-reddot-800 text-reddot-muted hover:border-reddot-red hover:text-reddot-text'
                }`}
              >
                {hidden ? 'Afficher' : 'Cacher'}
              </button>
              <button
                onClick={() => handleModerate('locked', !locked)}
                className={`text-xs px-2.5 py-1 rounded-full border transition font-medium ${
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

        {/* Reply form */}
        {showReply && (
          <div className="mx-4 mb-4 bg-reddot-800/40 rounded-xl p-3 space-y-2 border border-reddot-800 animate-slide-down">
            <MentionTextarea
              value={replyContent}
              onChange={setReplyContent}
              participants={participants}
              placeholder="Votre réponse..."
              rows={2}
              className="w-full bg-reddot-950/60 rounded-lg px-3 py-2 text-sm text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red resize-none border border-reddot-800"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                className="bg-reddot-red hover:bg-reddot-red-light transition px-4 py-1.5 rounded-full text-xs font-bold"
              >
                Envoyer
              </button>
              <button
                onClick={() => setShowReply(false)}
                className="text-xs text-reddot-muted hover:text-reddot-text transition px-3 py-1.5 rounded-full hover:bg-reddot-800"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {msg.replies && msg.replies.map(reply => (
        <Message key={reply.id} msg={reply} user={user} onReply={onReply} depth={depth + 1} topicLocked={topicLocked} participants={participants} />
      ))}
    </div>
  )
}

export default function TopicPage() {
  const { id } = useParams()
  const [topic, setTopic] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [hidden, setHidden] = useState(false)
  const [locked, setLocked] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const isAdmin = user?.role === 'ADMIN'

  const fetchTopic = async () => {
    try {
      const data = await apiFetch(`/api/topics/${id}`)
      setTopic(data)
      setHidden(data.hidden)
      setLocked(data.locked)
    } catch {
      setTopic(null)
    }
  }

  const fetchMessages = async () => {
    setLoadingMessages(true)
    try {
      const data = await apiFetch(`/api/topics/${id}/messages`)
      setMessages(data)
    } catch {
      setMessages([])
    } finally {
      setLoadingMessages(false)
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

  const handleReport = async () => {
    const reason = prompt('Raison du signalement (optionnel) :')
    if (reason === null) return
    try {
      await apiFetch(`/api/topics/${id}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      })
      alert('Topic signalé !')
    } catch {
      alert('Erreur lors du signalement')
    }
  }

  const handleDeleteTopic = async () => {
    if (!confirm('Supprimer ce topic ? Cette action est irréversible.')) return
    try {
      await apiFetch(`/api/topics/${id}`, { method: 'DELETE' })
      navigate('/')
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const handleModerate = async (field, value) => {
    try {
      await apiFetch(`/api/admin/topics/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: value })
      })
      if (field === 'hidden') setHidden(value)
      if (field === 'locked') setLocked(value)
    } catch {
      alert('Erreur lors de la modération')
    }
  }

  const participants = collectParticipants(messages, topic?.author)

  if (!topic) return <p className="text-reddot-muted">Chargement...</p>

  return (
    <div className="space-y-5">

      {/* Topic card */}
      <div className={`rounded-2xl border overflow-hidden transition-all animate-fade-in ${
        hidden
          ? 'border-dashed border-reddot-800 bg-reddot-950 opacity-70'
          : 'bg-reddot-900 border-reddot-800'
      }`}>
        {locked && <div className="h-0.5 bg-gradient-to-r from-reddot-red to-reddot-red-light" />}

        <div className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">

              {/* Title + badges */}
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <h1 className="text-2xl font-black tracking-tight leading-tight">{topic.title}</h1>
                {hidden && (
                  <span className="text-xs text-reddot-muted italic bg-reddot-800 px-2.5 py-1 rounded-full shrink-0">caché</span>
                )}
                {locked && (
                  <span className="relative group cursor-default select-none shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs bg-reddot-800 border border-reddot-700 text-reddot-muted px-2.5 py-1 rounded-full font-medium">
                      🔒 Verrouillé
                    </span>
                    <span className="absolute top-full left-0 mt-2 w-64 text-xs bg-reddot-800 border border-reddot-700 text-reddot-text rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl leading-relaxed">
                      Ce topic a été <span className="text-reddot-red-light font-semibold">verrouillé par un administrateur</span>. Les nouvelles réponses sont désactivées.
                    </span>
                  </span>
                )}
              </div>

              {topic.description && (
                <p className="text-reddot-muted text-sm leading-relaxed mb-4">{topic.description}</p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-1.5 text-xs text-reddot-muted flex-wrap">
                <Link to={`/profile/${topic.author}`} className="flex items-center gap-1.5 hover:text-reddot-text transition">
                  <div className="w-4 h-4 rounded-full bg-reddot-red flex items-center justify-center text-[9px] font-bold shrink-0">
                    {topic.author[0].toUpperCase()}
                  </div>
                  <span>{topic.author}</span>
                </Link>
                <span className="text-reddot-800 mx-0.5">·</span>
                <span>{topic.views} vues</span>
                <span className="text-reddot-800 mx-0.5">·</span>
                <span>{formatDate(topic.createdAt)}</span>
                <span className="text-reddot-800 mx-0.5">·</span>
                <span>{messages.length} {messages.length === 1 ? 'réponse' : 'réponses'}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 shrink-0">
              {user && !isAdmin && (
                <>
                  {user.username === topic.author && (
                    <button
                      onClick={handleDeleteTopic}
                      className="text-xs text-reddot-muted hover:text-reddot-red-light transition px-3 py-1.5 rounded-full border border-reddot-800 hover:border-reddot-red"
                    >
                      Supprimer
                    </button>
                  )}
                  <button
                    onClick={handleReport}
                    className="text-xs text-reddot-muted hover:text-reddot-red-light transition px-3 py-1.5 rounded-full border border-reddot-800 hover:border-reddot-red"
                  >
                    Signaler
                  </button>
                </>
              )}
              {isAdmin && (
                <>
                  <p className="text-xs text-reddot-muted font-medium text-right uppercase tracking-wider mb-0.5">Modération</p>
                  <button
                    onClick={() => handleModerate('hidden', !hidden)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                      hidden
                        ? 'border-reddot-red text-reddot-red-light hover:bg-reddot-red hover:text-reddot-text'
                        : 'border-reddot-800 text-reddot-muted hover:border-reddot-red hover:text-reddot-text'
                    }`}
                  >
                    {hidden ? 'Afficher' : 'Cacher'}
                  </button>
                  <button
                    onClick={() => handleModerate('locked', !locked)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                      locked
                        ? 'border-reddot-red text-reddot-red-light hover:bg-reddot-red hover:text-reddot-text'
                        : 'border-reddot-800 text-reddot-muted hover:border-reddot-red hover:text-reddot-text'
                    }`}
                  >
                    {locked ? 'Déverrouiller' : 'Verrouiller'}
                  </button>
                  <button
                    onClick={handleDeleteTopic}
                    className="text-xs px-3 py-1.5 rounded-full border border-reddot-800 text-reddot-muted hover:border-reddot-red hover:text-reddot-red-light transition font-medium"
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {loadingMessages ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-reddot-900 border border-reddot-800 rounded-2xl overflow-hidden animate-pulse">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-reddot-800/50">
                <div className="w-7 h-7 rounded-full bg-reddot-800 shrink-0" />
                <div className="h-3 bg-reddot-800 rounded-full w-24" />
                <div className="h-3 bg-reddot-800 rounded-full w-16 ml-auto" />
              </div>
              <div className="px-4 py-3.5 space-y-2">
                <div className="h-3 bg-reddot-800 rounded-full w-full" />
                <div className="h-3 bg-reddot-800 rounded-full w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-reddot-muted">
          <p className="text-sm">Aucun message pour l'instant.</p>
          {!locked && user && <p className="text-xs mt-1 opacity-60">Soyez le premier à participer !</p>}
        </div>
      ) : (
        <div className="space-y-1">
          {messages.map((msg, i) => (
            <div key={msg.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in">
              <Message msg={msg} user={user} onReply={fetchMessages} depth={0} topicLocked={locked} participants={participants} />
            </div>
          ))}
        </div>
      )}

      {/* Bottom: form / locked / login */}
      {locked ? (
        <div className="flex items-center gap-4 bg-reddot-900 border border-reddot-800 rounded-2xl px-5 py-4">
          <div className="w-9 h-9 rounded-full bg-reddot-800 border border-reddot-700 flex items-center justify-center text-base shrink-0">
            🔒
          </div>
          <div>
            <p className="text-sm font-semibold text-reddot-text">Topic verrouillé</p>
            <p className="text-xs text-reddot-muted mt-0.5">Un administrateur a désactivé les nouvelles réponses sur ce topic.</p>
          </div>
        </div>
      ) : user ? (
        <div className="bg-reddot-900 rounded-2xl border border-reddot-800">
          <div className="px-4 pt-4 pb-3 space-y-3">
            <MentionTextarea
              value={newMessage}
              onChange={setNewMessage}
              participants={participants}
              placeholder="Écrire un message..."
              rows={3}
              className="w-full bg-reddot-800 rounded-xl px-4 py-3 text-reddot-text placeholder-reddot-muted outline-none focus:ring-2 focus:ring-reddot-red resize-none text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-reddot-muted/60">
                {newMessage.length > 0 ? `${newMessage.length} caractères` : ''}
              </span>
              <button
                onClick={handlePost}
                disabled={!newMessage.trim()}
                className="bg-reddot-red hover:bg-reddot-red-light disabled:opacity-40 disabled:cursor-not-allowed transition px-5 py-2 rounded-full text-sm font-bold"
              >
                Publier
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-reddot-900 rounded-2xl border border-reddot-800">
          <p className="text-reddot-muted text-sm">
            <a href="/login" className="text-reddot-red-light hover:underline font-semibold">Connectez-vous</a> pour participer à la discussion
          </p>
        </div>
      )}
    </div>
  )
}
