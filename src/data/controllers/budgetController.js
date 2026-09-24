import { storage } from '../../core/storage.js'
import { uid } from '../../core/utils.js'
import { STORAGE_KEYS } from '../../core/constants.js'

export function loadBudgets() {
  return storage.getJSON(STORAGE_KEYS.budgets) || []
}

export function saveBudgets(budgets) {
  storage.setJSON(STORAGE_KEYS.budgets, budgets)
}

export function normalizeBudget(category, month, limit) {
  return { id: uid(), category, month, limit: Number(limit) || 0 }
}

export function upsertBudget(category, month, limit) {
  const budgets = loadBudgets()
  const idx = budgets.findIndex((b) => b.category === category && b.month === month)
  if (idx >= 0) {
    budgets[idx] = { ...budgets[idx], limit: Number(limit) || 0 }
  } else {
    budgets.push(normalizeBudget(category, month, limit))
  }
  saveBudgets(budgets)
}

export function removeBudget(id) {
  saveBudgets(loadBudgets().filter((b) => b.id !== id))
}
