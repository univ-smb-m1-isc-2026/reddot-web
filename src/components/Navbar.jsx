import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pendingReports, setPendingReports] = useState(0)

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return
    apiFetch('/api/admin/reports?resolved=false')
      .then(data => setPendingReports(Array.isArray(data) ? data.length : (data?.content?.length ?? 0)))
      .catch(() => {})
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-reddot-900 border-b border-reddot-800 px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-reddot-red"></div>
          <span className="text-xl font-black">red<span className="text-reddot-red-light">dot</span></span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to={`/profile/${user.username}`} className="text-sm text-reddot-muted hover:text-reddot-text transition">
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-reddot-muted hover:text-reddot-red-light transition"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-reddot-muted hover:text-reddot-text transition">
                Connexion
              </Link>
              <Link to="/register" className="text-sm bg-reddot-red hover:bg-reddot-red-light transition px-4 py-1.5 rounded-lg font-medium">
                S'inscrire
              </Link>
            </>
          )}
          {user && user.role === 'ADMIN' && (
            <Link to="/admin" className="relative text-sm text-reddot-muted hover:text-reddot-red-light transition">
              Dashboard Admin
              {pendingReports > 0 && (
                <span className="absolute -top-2 -right-4 min-w-[16px] h-4 bg-reddot-red text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {pendingReports > 99 ? '99+' : pendingReports}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}