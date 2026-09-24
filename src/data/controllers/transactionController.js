import { storage } from '../../core/storage.js'
import { uid, todayStr, money } from '../../core/utils.js'
import { STORAGE_KEYS, TRANSACTION_TYPES } from '../../core/constants.js'
import { loadAccounts, saveAccounts, accountBalance, canWithdraw } from './accountController.js'
import { reduceGoalSaving } from './savingsGoalController.js'

export const emptyTransactionForm = () => ({
  type: TRANSACTION_TYPES.EXPENSE,
  accountId: '',
  toAccountId: '',
  amount: '',
  category: '餐饮',
  date: todayStr(),
  note: '',
  isLarge: false
})

export function loadTransactions() {
  return storage.getJSON(STORAGE_KEYS.transactions) || []
}

export function saveTransactions(transactions) {
  storage.setJSON(STORAGE_KEYS.transactions, transactions)
}

export function formatAccountLabel(accountId) {
  const account = loadAccounts().find((a) => a.id === accountId)
  return account ? account.name : '未知账户'
}

export function normalizeTransaction(form) {
  const amount = Number(form.amount) || 0
  const base = {
    id: uid(),
    amount,
    date: form.date || todayStr(),
    note: String(form.note || '').trim(),
    isLarge: Boolean(form.isLarge),
    createdAt: Date.now()
  }
  if (form.type === TRANSACTION_TYPES.TRANSFER) {
    return { ...base, type: TRANSACTION_TYPES.TRANSFER, fromAccountId: form.accountId, toAccountId: form.toAccountId }
  }
  return { ...base, type: form.type, accountId: form.accountId, category: form.category }
}

function applyTransfer(accounts, fromAccountId, toAccountId, amount) {
  return accounts.map((a) => {
    if (a.id === fromAccountId) return { ...a, balance: accountBalance(a) - amount }
    if (a.id === toAccountId) return { ...a, balance: accountBalance(a) + amount }
    return a
  })
}

function reconcileAll() {
  const accounts = loadAccounts()
  const transactions = loadTransactions()
  const balances = new Map(accounts.map((a) => [a.id, Number(a.initialBalance) || 0]))
  for (const t of transactions) {
    if (t.type === TRANSACTION_TYPES.INCOME) balances.set(t.accountId, (balances.get(t.accountId) || 0) + t.amount)
    else if (t.type === TRANSACTION_TYPES.EXPENSE) balances.set(t.accountId, (balances.get(t.accountId) || 0) - t.amount)
    else if (t.type === TRANSACTION_TYPES.TRANSFER) {
      balances.set(t.fromAccountId, (balances.get(t.fromAccountId) || 0) - t.amount)
      balances.set(t.toAccountId, (balances.get(t.toAccountId) || 0) + t.amount)
    }
  }
  saveAccounts(accounts.map((a) => ({ ...a, balance: balances.get(a.id) || 0 })))
}

export function addTransaction(form) {
  const accounts = loadAccounts()
  const amount = Number(form.amount)
  if (!form.accountId || !amount) return { ok: false, message: '请填写账户与金额' }
  if (!(amount > 0)) return { ok: false, message: '金额必须大于 0' }
  const account = accounts.find((a) => a.id === form.accountId)
  if (!account) return { ok: false, message: '账户不存在' }
  if (form.type === TRANSACTION_TYPES.TRANSFER) {
    if (form.accountId === form.toAccountId) return { ok: false, message: '转账账户不能相同' }
    const toAccount = accounts.find((a) => a.id === form.toAccountId)
    if (!toAccount) return { ok: false, message: '转入账户不存在' }
    if (!canWithdraw(account, amount)) {
      return { ok: false, message: `转出账户「${account.name}」余额不足（当前 ¥${money(accountBalance(account))}）` }
    }
  } else if (form.type === TRANSACTION_TYPES.EXPENSE && !canWithdraw(account, amount)) {
    return { ok: false, message: `账户「${account.name}」余额不足（当前 ¥${money(accountBalance(account))}），无法记这笔支出` }
  }
  const transaction = normalizeTransaction({ ...form, amount })
  const nextAccounts = form.type === TRANSACTION_TYPES.TRANSFER
    ? applyTransfer(accounts, form.accountId, form.toAccountId, transaction.amount)
    : accounts.map((a) =>
        a.id === form.accountId
          ? { ...a, balance: accountBalance(a) + (form.type === TRANSACTION_TYPES.INCOME ? transaction.amount : -transaction.amount) }
          : a
      )
  saveAccounts(nextAccounts)
  saveTransactions([...loadTransactions(), transaction])
  return { ok: true, transaction }
}

export function removeTransaction(id, confirmFn = window.confirm) {
  const transaction = loadTransactions().find((t) => t.id === id)
  if (!transaction) return false
  const tip = transaction.goalId ? '确认删除这条记账记录吗？账户余额与储蓄目标进度将自动回滚。' : '确认删除这条记账记录吗？账户余额将自动回滚。'
  if (!confirmFn(tip)) return false
  saveTransactions(loadTransactions().filter((t) => t.id !== id))
  if (transaction.type === TRANSACTION_TYPES.EXPENSE && transaction.goalId) {
    reduceGoalSaving(transaction.goalId, transaction.amount)
  }
  reconcileAll()
  return true
}

