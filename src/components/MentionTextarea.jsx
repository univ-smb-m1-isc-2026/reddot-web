import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function MentionTextarea({ value, onChange, participants = [], placeholder, rows = 3, className }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [query, setQuery] = useState('')
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const textareaRef = useRef(null)

  const filtered = participants
    .filter(p => query === '' || p.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 6)

  const updateDropPos = () => {
    if (!textareaRef.current) return
    const rect = textareaRef.current.getBoundingClientRect()
    setDropPos({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    })
  }

  const handleChange = (e) => {
    const val = e.target.value
    const cursor = e.target.selectionStart
    onChange(val)

    const textBefore = val.slice(0, cursor)
    const match = textBefore.match(/@(\w*)$/)
    if (match) {
      setQuery(match[1])
      updateDropPos()
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const insertMention = (username) => {
    const cursor = textareaRef.current.selectionStart
    const textBefore = value.slice(0, cursor)
    const match = textBefore.match(/@(\w*)$/)
    if (match) {
      const before = value.slice(0, match.index)
      const after = value.slice(cursor)
      onChange(before + '@' + username + ' ' + after)
    }
    setShowDropdown(false)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const dropdown = showDropdown && filtered.length > 0 && createPortal(
    <div
      style={{
        position: 'absolute',
        top: dropPos.top - 8,
        left: dropPos.left,
        width: dropPos.width,
        transform: 'translateY(-100%)',
        zIndex: 9999,
      }}
    >
      <div className="bg-reddot-950 border border-reddot-800 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
        <p className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-widest text-reddot-muted/60 font-semibold select-none">
          Mentionner
        </p>
        {filtered.map((p, i) => (
          <button
            key={p}
            onMouseDown={e => { e.preventDefault(); insertMention(p) }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-reddot-800/60 ${
              i < filtered.length - 1 ? 'border-b border-reddot-800/40' : ''
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-reddot-red/80 flex items-center justify-center text-[10px] font-bold shrink-0 text-white">
              {p[0].toUpperCase()}
            </div>
            <span className="text-reddot-text font-medium">
              <span className="text-reddot-red-light">@</span>{p}
            </span>
          </button>
        ))}
      </div>
    </div>,
    document.body
  )

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={e => e.key === 'Escape' && setShowDropdown(false)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />
      {dropdown}
    </div>
  )
}
