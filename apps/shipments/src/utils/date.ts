export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '' // invalid date handling

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12
  hours = hours === 0 ? 12 : hours // 0 => 12
  const formattedHours = String(hours).padStart(2, '0')

  return `${day}/${month}/${year}, ${formattedHours}:${minutes}: ${ampm}`
}
