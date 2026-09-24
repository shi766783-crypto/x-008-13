import { USER_ID } from './constants.js'
export const uid = (() => {
  let seq = 0
  return () => `${Date.now().toString(36)}-${(seq++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`
})()

export function todayStr(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return toDateStr(d)
}

export function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function monthStrOf(dateStr) {
  return dateStr.slice(0, 7)
}

export function monthLabel(monthStr) {
  return `${monthStr.slice(0, 4)}年${Number(monthStr.slice(5, 7))}月`
}

export function monthListFrom(monthsBack) {
  const out = []
  const now = new Date()
  now.setDate(1)
  for (let i = monthsBack; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

export function money(value) {
  const n = Number(value) || 0
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function daysBetween(dateStrA, dateStrB) {
  const a = new Date(`${dateStrA}T00:00:00`)
  const b = new Date(`${dateStrB}T00:00:00`)
  return Math.round((b - a) / 86400000)
}

export function byId(collection, id) {
  return (collection || []).find((item) => item.id === id)
}

export function calcPercent(used, limit) {
  if (!limit || Number(limit) <= 0) return 0
  return Math.round((Number(used) / Number(limit)) * 100)
}

