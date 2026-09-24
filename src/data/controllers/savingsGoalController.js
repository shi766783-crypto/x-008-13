import { storage } from '../../core/storage.js'
import { uid, todayStr, money } from '../../core/utils.js'
import { STORAGE_KEYS, DEFAULT_GOAL_TYPE, TRANSACTION_TYPES, SAVINGS_CATEGORY } from '../../core/constants.js'
import { loadAccounts } from './accountController.js'
import { addTransaction } from './transactionController.js'

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

export function addGoalSaving(id, amount, accountId) {
  const value = Number(amount)
  if (!value || value <= 0) return { ok: false, reason: '请输入有效的存入金额' }
  const goal = loadGoals().find((g) => g.id === id)
  if (!goal) return { ok: false, reason: '储蓄目标不存在' }
  const account = loadAccounts().find((a) => a.id === accountId)
  if (!account) return { ok: false, reason: '请选择扣款账户' }
  if (Number(account.balance) < value) {
    return { ok: false, reason: `账户「${account.name}」余额不足（当前 ¥${money(account.balance)}），无法存入 ¥${money(value)}` }
  }
  const transaction = addTransaction({
    type: TRANSACTION_TYPES.EXPENSE,
    accountId,
    amount: value,
    category: SAVINGS_CATEGORY,
    date: todayStr(),
    note: `存入储蓄目标「${goal.name}」`,
    isLarge: value >= 1000
  })
  if (!transaction) return { ok: false, reason: '存入失败，请重试' }
  saveGoals(loadGoals().map((g) => (g.id === id ? { ...g, savedAmount: Number(g.savedAmount || 0) + value } : g)))
  return { ok: true }
}

export function removeGoal(id, confirmFn = window.confirm) {
  if (!confirmFn(`确认删除储蓄目标「${id}」吗？`)) return false
  saveGoals(loadGoals().filter((g) => g.id !== id))
  return true
}
