import { storage } from '../../core/storage.js'
import { STORAGE_KEYS } from '../../core/constants.js'

const DEFAULT_STATE = {
  name: '我的家庭',
  createdAt: '',
  currency: 'CNY'
}

export function loadUser() {
  const saved = storage.getJSON(STORAGE_KEYS.user)
  return { ...DEFAULT_STATE, ...(saved || {}) }
}

export function saveUser(user) {
  storage.setJSON(STORAGE_KEYS.user, user)
}
