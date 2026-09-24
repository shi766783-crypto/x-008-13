import { storage } from '../../core/storage.js'
import { uid } from '../../core/utils.js'
import { STORAGE_KEYS, DEFAULT_GOAL_TYPE } from '../../core/constants.js'

export const emptyGoalForm = () => ({
  name: '',
  targetAmount: '',
  targetDate: '',
  savedAmount: ''
})

export function loadGoals() {
  return storage.getJSON(STORAGE_KEYS.savingsGoals) || []
}

export function saveGoals(goals) {
  storage.setJSON(STORAGE_KEYS.savingsGoals, goals)
}

export function normalizeGoal(form) {
  return {
    id: uid(),
    name: String(form.name || '').trim(),
    type: DEFAULT_GOAL_TYPE,
    targetAmount: Number(form.targetAmount) || 0,
    targetDate: form.targetDate || '',
    savedAmount: Number(form.savedAmount) || 0
  }
}

export function addGoal(form) {
  const goal = normalizeGoal(form)
  saveGoals([...loadGoals(), goal])
  return goal
}

export function updateGoal(id, form) {
  const goals = loadGoals().map((g) =>
    g.id === id
      ? { ...g, name: String(form.name || '').trim(), targetAmount: Number(form.targetAmount) || 0, targetDate: form.targetDate || '' }
      : g
  )
  saveGoals(goals)
}

export function addGoalSaving(id, amount) {
  const goals = loadGoals().map((g) =>
    g.id === id ? { ...g, savedAmount: Number(g.savedAmount || 0) + Number(amount) } : g
  )
  saveGoals(goals)
}

export function removeGoal(id, confirmFn = window.confirm) {
  if (!confirmFn(`确认删除储蓄目标「${id}」吗？`)) return false
  saveGoals(loadGoals().filter((g) => g.id !== id))
  return true
}
