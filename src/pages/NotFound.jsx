import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-full bg-reddot-900 border-2 border-reddot-800 mb-6 flex items-center justify-center">
        <span className="text-3xl font-black text-reddot-red">!</span>
      </div>
      <h1 className="text-7xl font-black tracking-tight text-reddot-text mb-3">404</h1>
      <p className="text-reddot-muted text-sm mb-8 max-w-xs">Cette page n'existe pas ou a été supprimée.</p>
      <Link
        to="/"
        className="bg-reddot-red hover:bg-reddot-red-light transition px-6 py-2.5 rounded-full font-bold text-sm"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
