export function formatDate(dateString) {
  console.log('[formatDate] raw:', dateString)

  const date = new Date(dateString)
  const now = new Date()

  console.log('[formatDate] parsed local:', date.toString())
  console.log('[formatDate] now local:', now.toString())

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowDay  = new Date(now.getFullYear(),  now.getMonth(),  now.getDate())

  const diffDays = Math.round((nowDay - dateDay) / (1000 * 60 * 60 * 24))
  console.log('[formatDate] diffDays:', diffDays)

  if (diffDays === 1) return "Aujourd'hui"
  if (diffDays === 2) return 'Hier'
  return date.toLocaleDateString('fr-FR')
}
