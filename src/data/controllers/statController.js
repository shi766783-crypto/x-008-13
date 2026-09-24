import { loadTransactions } from './transactionController.js'
import { loadAccounts } from './accountController.js'
import { loadBudgets } from './budgetController.js'
import { loadGoals } from './savingsGoalController.js'
import { TRANSACTION_TYPES, BUDGET_WARN_RATIO } from '../../core/constants.js'
import { todayStr, monthStrOf, calcPercent, byId } from '../../core/utils.js'

export function accountStat(accountId) {
  const account = byId(loadAccounts(), accountId)
  if (!account) return null
  const rows = loadTransactions()
  const monthly = new Map()
  const monthlyIncome = new Map()
  const monthlyExpense = new Map()
  for (const t of rows) {
    if (t.type === TRANSACTION_TYPES.INCOME && t.accountId === accountId) {
      monthlyIncome.set(t.date.slice(0, 7), (monthlyIncome.get(t.date.slice(0, 7)) || 0) + t.amount)
    } else if (t.type === TRANSACTION_TYPES.EXPENSE && t.accountId === accountId) {
      monthlyExpense.set(t.date.slice(0, 7), (monthlyExpense.get(t.date.slice(0, 7)) || 0) + t.amount)
    } else if (t.type === TRANSACTION_TYPES.TRANSFER) {
      if (t.fromAccountId === accountId) monthly.set(t.date.slice(0, 7), (monthly.get(t.date.slice(0, 7)) || 0) - t.amount)
      if (t.toAccountId === accountId) monthly.set(t.date.slice(0, 7), (monthly.get(t.date.slice(0, 7)) || 0) + t.amount)
    }
  }
  const cur = monthStrOf(todayStr())
  const income = monthlyIncome.get(cur) || 0
  const expense = monthlyExpense.get(cur) || 0
  const transfer = monthly.get(cur) || 0
  return { account, income, expense, transfer }
}

export function budgetView(month) {
  const budgets = loadBudgets().filter((b) => b.month === month)
  const usage = loadTransactions()
    .filter((t) => t.type === TRANSACTION_TYPES.EXPENSE && t.date.startsWith(month))
    .reduce((map, t) => map.set(t.category, (map.get(t.category) || 0) + t.amount), new Map())
  return budgets
    .map((b) => {
      const used = usage.get(b.category) || 0
      return {
        ...b,
        used,
        remaining: b.limit - used,
        percent: calcPercent(used, b.limit),
        status: used > b.limit ? 'danger' : used >= b.limit * BUDGET_WARN_RATIO ? 'warn' : 'ok'
      }
    })
    .sort((a, b) => b.percent - a.percent)
}

export function goalViews() {
  const today = todayStr()
  return loadGoals().map((g) => {
    const leftDays = Math.max(0, Math.ceil((new Date(`${g.targetDate}T23:59:59`) - new Date(`${today}T00:00:00`)) / 86400000))
    const remainingAmount = Math.max(0, g.targetAmount - g.savedAmount)
    const percent = calcPercent(g.savedAmount, g.targetAmount)
    const monthlyAmount = leftDays > 0 ? remainingAmount / Math.max(1, Math.round(leftDays / 30)) : 0
    const weeklyAmount = leftDays > 0 ? remainingAmount / Math.max(1, Math.round(leftDays / 7)) : 0
    const dailyAmount = leftDays > 0 ? remainingAmount / leftDays : 0
    return {
      ...g,
      leftDays,
      remainingAmount,
      percent,
      monthlyAmount,
      weeklyAmount,
      dailyAmount,
      status: percent >= 100 ? 'done' : leftDays === 0 ? 'overdue' : 'active'
    }
  })
}

export function monthlyBudgetStatus(month) {
  const views = budgetView(month)
  const totalLimit = views.reduce((s, v) => s + v.limit, 0)
  const totalUsed = views.reduce((s, v) => s + v.used, 0)
  return { views, totalLimit, totalUsed }
}
