import { storage } from '../../core/storage.js'
import { uid, todayStr, money } from '../../core/utils.js'
import { STORAGE_KEYS, DEFAULT_GOAL_TYPE, TRANSACTION_TYPES, SAVINGS_CATEGORY } from '../../core/constants.js'
import { loadAccounts, saveAccounts, accountBalance, canWithdraw } from './accountController.js'

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

// 向储蓄目标存入：同步扣减扣款账户余额，并生成一条「储蓄」支出流水。
// 返回 { ok, goal, transaction } 或 { ok: false, message }。
export function addGoalSaving(id, amount, accountId) {
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, message: '请输入大于 0 的存入金额' }
  }
  if (!accountId) {
    return { ok: false, message: '请选择扣款账户' }
  }

  const goals = loadGoals()
  const goal = goals.find((g) => g.id === id)
  if (!goal) return { ok: false, message: '储蓄目标不存在' }

  const accounts = loadAccounts()
  const account = accounts.find((a) => a.id === accountId)
  if (!account) return { ok: false, message: '扣款账户不存在' }

  if (!canWithdraw(account, value)) {
    return {
      ok: false,
      message: `账户「${account.name}」余额不足（当前 ¥${money(accountBalance(account))}），无法存入 ¥${money(value)}`
    }
  }

  const transaction = {
    id: uid(),
    type: TRANSACTION_TYPES.EXPENSE,
    accountId,
    amount: value,
    category: SAVINGS_CATEGORY,
    date: todayStr(),
    note: `存入储蓄目标：${goal.name}`,
    isLarge: false,
    goalId: goal.id,
    goalName: goal.name,
    createdAt: Date.now()
  }

  saveAccounts(
    accounts.map((a) => (a.id === accountId ? { ...a, balance: accountBalance(a) - value } : a))
  )
  storage.setJSON(STORAGE_KEYS.transactions, [...(storage.getJSON(STORAGE_KEYS.transactions) || []), transaction])
  saveGoals(goals.map((g) => (g.id === id ? { ...g, savedAmount: Number(g.savedAmount || 0) + value } : g)))

  return { ok: true, goal, transaction }
}

// 回退一笔目标存入（删除对应支出流水时调用），金额回退至 0 为止。
export function reduceGoalSaving(goalId, amount) {
  if (!goalId) return
  const goals = loadGoals()
  if (!goals.some((g) => g.id === goalId)) return
  saveGoals(
    goals.map((g) =>
      g.id === goalId ? { ...g, savedAmount: Math.max(0, Number(g.savedAmount || 0) - Number(amount)) } : g
    )
  )
}

export function removeGoal(id, confirmFn = window.confirm) {
  if (!confirmFn(`确认删除储蓄目标「${id}」吗？`)) return false
  saveGoals(loadGoals().filter((g) => g.id !== id))
  return true
}
