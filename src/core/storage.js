const EMPTY = JSON.stringify(null)

export const storage = {
  getJSON(key) {
    const raw = localStorage.getItem(key)
    if (!raw || raw === EMPTY) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
  setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }
}
