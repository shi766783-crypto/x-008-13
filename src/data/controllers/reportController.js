import { loadTransactions } from './transactionController.js'
import { TRANSACTION_TYPES } from '../../core/constants.js'

function sortByDateDesc(transactions) {
  return [...transactions].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1))
}

export function transactionList({ month, type, category, largeOnly, accountId, keyword, limit } = {}) {
  let list = loadTransactions()
  if (month) list = list.filter((t) => t.date.startsWith(month))
  if (type) list = list.filter((t) => t.type === type)
  if (category) list = list.filter((t) => t.type !== TRANSACTION_TYPES.TRANSFER && t.category === category)
  if (largeOnly) list = list.filter((t) => t.isLarge)
  if (accountId) list = list.filter((t) => t.type === TRANSACTION_TYPES.TRANSFER ? t.fromAccountId === accountId || t.toAccountId === accountId : t.accountId === accountId)
  if (keyword) {
    const k = String(keyword).toLowerCase()
    list = list.filter((t) => String(t.note || '').toLowerCase().includes(k) || String(t.category || '').toLowerCase().includes(k))
  }
  list = sortByDateDesc(list)
  return limit ? list.slice(0, limit) : list
}

export function incomeAndExpense(month) {
  const rows = loadTransactions().filter((t) => t.type !== TRANSACTION_TYPES.TRANSFER && (!month || t.date.startsWith(month)))
  let income = 0
  let expense = 0
  for (const t of rows) {
    if (t.type === TRANSACTION_TYPES.INCOME) income += t.amount
    else expense += t.amount
  }
  return { income, expense, balance: income - expense }
}

export function expenseByCategory(month) {
  const map = new Map()
  for (const t of loadTransactions()) {
    if (t.type !== TRANSACTION_TYPES.EXPENSE) continue
    if (month && !t.date.startsWith(month)) continue
    map.set(t.category, (map.get(t.category) || 0) + t.amount)
  }
  return [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function budgetUsage(month) {
  const usage = new Map()
  for (const t of loadTransactions()) {
    if (t.type !== TRANSACTION_TYPES.EXPENSE) continue
    if (month && !t.date.startsWith(month)) continue
    usage.set(t.category, (usage.get(t.category) || 0) + t.amount)
  }
  return usage
}

export function monthlySeries(months) {
  return months.map((month) => {
    const { income, expense } = incomeAndExpense(month)
    return { month, income, expense }
  })
}

export function savingsRate(income, expense) {
  if (!income || income <= 0) return 0
  return Math.round(((income - expense) / income) * 100)
}

export function monthlyTotalsByMonth(month, type) {
  const rows = loadTransactions().filter((t) => t.type === type && t.date.startsWith(month))
  const map = new Map()
  for (const t of rows) map.set(t.date, (map.get(t.date) || 0) + t.amount)
  return map
}

export function largestExpenseInMonth(month) {
  const rows = loadTransactions().filter((t) => t.type === TRANSACTION_TYPES.EXPENSE && t.date.startsWith(month))
  let max = 0
  for (const t of rows) if (t.amount > max) max = t.amount
  return max
}

export function totalExpenseOfMonth(month) {
  const rows = loadTransactions().filter((t) => t.type === TRANSACTION_TYPES.EXPENSE && t.date.startsWith(month))
  return rows.reduce((sum, t) => sum + t.amount, 0)
}
