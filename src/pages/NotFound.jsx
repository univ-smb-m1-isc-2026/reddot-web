import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const MESSAGES = [
  "Ce topic a été supprimé par un admin.",
  "La page a été signalée trop de fois.",
  "Quelqu'un a verrouillé l'URL.",
  "Le développeur a oublié cette route.",
  "Cette page est cachée. Très cachée.",
  "Erreur 404 : introuvable, comme la motivation.",
  "T'as mal copié l'URL, avoue.",
]

export default function NotFound() {
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
  const [clicked, setClicked] = useState(0)
  const [wobble, setWobble] = useState(false)

  const handleClick = () => {
    setClicked(c => c + 1)
    setWobble(true)
    setTimeout(() => setWobble(false), 500)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center select-none">

      {/* Big 404 with glitch layers */}
      <div className="relative mb-2 cursor-pointer" onClick={handleClick}>
        <span
          className="text-[9rem] font-black leading-none text-reddot-text block transition-transform duration-300"
          style={{ transform: wobble ? `rotate(${(Math.random() - 0.5) * 12}deg) scale(1.05)` : 'none' }}
        >
          4
          <span className="text-reddot-red" style={{
            textShadow: clicked > 3 ? '3px 0 0 #e74c3c, -3px 0 0 #2c2825' : 'none',
            transition: 'text-shadow 0.1s'
          }}>0</span>
          4
        </span>

        {clicked > 0 && (
          <span
            key={clicked}
            className="absolute -top-2 -right-2 text-xs bg-reddot-red text-reddot-text rounded-full w-5 h-5 flex items-center justify-center font-bold animate-scale-in"
          >
            {clicked}
          </span>
        )}
      </div>

      {/* Subtitle that changes on many clicks */}
      <p className="text-reddot-muted text-sm mb-1 transition-all duration-300">
        {clicked === 0 && msg}
        {clicked >= 1 && clicked < 5 && "Tu peux cliquer encore..."}
        {clicked >= 5 && clicked < 10 && "Ok tu t'amuses vraiment."}
        {clicked >= 10 && clicked < 20 && "Sérieusement, arrête."}
        {clicked >= 20 && "...Bon, c'est toujours une 404."}
      </p>

      {clicked >= 5 && (
        <p className="text-xs text-reddot-muted/50 mb-4 animate-fade-in">
          {clicked} clics • record personnel
        </p>
      )}

      <div className={`mt-8 flex flex-col items-center gap-3 ${clicked < 5 ? 'mt-8' : 'mt-2'}`}>
        <Link
          to="/"
          className="bg-reddot-red hover:bg-reddot-red-light active:scale-95 transition-all px-6 py-2.5 rounded-full font-bold text-sm"
        >
          Retour à l'accueil
        </Link>
        {clicked >= 10 && (
          <p className="text-xs text-reddot-muted animate-fade-in">
            (vraiment, retourne à l'accueil)
          </p>
        )}
      </div>
    </div>
  )
}
