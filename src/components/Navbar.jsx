import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
            <Link to="/admin" className="text-sm text-reddot-muted hover:text-reddot-red-light transition">
                Dashboard Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}