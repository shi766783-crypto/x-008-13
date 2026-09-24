import { storage } from '../../core/storage.js'
import { STORAGE_KEYS, TRANSACTION_TYPES, ACCOUNT_TYPES } from '../../core/constants.js'
import { todayStr, toDateStr } from '../../core/utils.js'
import { loadAccounts, saveAccounts } from './accountController.js'
import { saveTransactions } from './transactionController.js'
import { saveBudgets } from './budgetController.js'
import { saveGoals } from './savingsGoalController.js'
import { saveUser } from './userController.js'

let idCounter = 1
const genId = (prefix) => `${prefix}-${idCounter++}`

function dateDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toDateStr(d)
}

export function hasSeeded() {
  return Boolean(storage.getJSON(STORAGE_KEYS.seedFlag))
}

export function seedDemoData() {
  if (hasSeeded()) return

  const cash = { id: genId('acc'), name: '现金', type: 'cash', initialBalance: 2000, balance: 2000 }
  const bank = { id: genId('acc'), name: '工资卡', type: 'bank', initialBalance: 20000, balance: 20000 }
  const alipay = { id: genId('acc'), name: '支付宝', type: 'alipay', initialBalance: 3000, balance: 3000 }
  const wechat = { id: genId('acc'), name: '微信零钱', type: 'wechat', initialBalance: 500, balance: 500 }
  saveAccounts([cash, bank, alipay, wechat])

  const mk = (type, accountId, amount, date, category, note = '', isLarge = false, toAccountId = null) => ({
    id: genId('tx'),
    type,
    accountId,
    toAccountId,
    amount,
    date,
    category,
    note,
    isLarge,
    createdAt: Date.now() - idCounter * 1000
  })

  const txs = []
  const salaryDays = [28, 27, 26, 25, 24, 23]
  salaryDays.forEach((i) => txs.push(mk(TRANSACTION_TYPES.INCOME, bank.id, 12000, dateDaysAgo(i), '工资', '月度工资')))
  txs.push(mk(TRANSACTION_TYPES.INCOME, alipay.id, 800, dateDaysAgo(12), '兼职', '周末兼职'))
  txs.push(mk(TRANSACTION_TYPES.INCOME, wechat.id, 200, dateDaysAgo(9), '红包', '生日红包'))
  txs.push(mk(TRANSACTION_TYPES.INCOME, bank.id, 300, dateDaysAgo(3), '理财', '理财收益'))

  const exp = (amount, daysAgo, category, note, isLarge = false) => mk(TRANSACTION_TYPES.EXPENSE, alipay.id, amount, dateDaysAgo(daysAgo), category, note, isLarge)
  exp(45, 0, '餐饮', '午餐')
  exp(28, 0, '交通', '地铁')
  exp(320, 1, '购物', '日用品', true)
  exp(56, 1, '餐饮', '晚餐')
  exp(1800, 2, '住房', '本月房租', true)
  exp(88, 2, '娱乐', '电影票')
  exp(120, 3, '医疗', '常用药')
  exp(66, 4, '餐饮', '超市')
  exp(220, 5, '购物', '衣服', true)
  exp(150, 6, '人情', '朋友聚餐')
  exp(42, 7, '餐饮', '早餐')
  exp(75, 8, '交通', '打车')
  exp(300, 10, '教育', '课程资料', true)
  exp(40, 11, '餐饮', '奶茶')
  exp(500, 13, '其他', '维修费', true)
  exp(95, 15, '购物', '家居用品')
  exp(260, 18, '娱乐', '周末出游', true)
  exp(60, 20, '交通', '加油')

  txs.push({ ...mk(TRANSACTION_TYPES.TRANSFER, bank.id, 3000, dateDaysAgo(5), '', '发工资后转入余额宝', false, alipay.id), accountId: undefined, fromAccountId: bank.id, toAccountId: alipay.id })
  txs.push({ ...mk(TRANSACTION_TYPES.TRANSFER, bank.id, 800, dateDaysAgo(2), '', '房租转账', false, alipay.id), accountId: undefined, fromAccountId: bank.id, toAccountId: alipay.id })
  saveTransactions(txs)

  const now = new Date()
  const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  saveBudgets([
    { id: genId('bdg'), category: '餐饮', month: cur, limit: 1500 },
    { id: genId('bdg'), category: '交通', month: cur, limit: 500 },
    { id: genId('bdg'), category: '购物', month: cur, limit: 1000 },
    { id: genId('bdg'), category: '住房', month: cur, limit: 2500 },
    { id: genId('bdg'), category: '医疗', month: cur, limit: 500 },
    { id: genId('bdg'), category: '教育', month: cur, limit: 800 },
    { id: genId('bdg'), category: '娱乐', month: cur, limit: 600 },
    { id: genId('bdg'), category: '人情', month: cur, limit: 800 },
    { id: genId('bdg'), category: '其他', month: cur, limit: 600 }
  ])

  const target = new Date()
  target.setMonth(target.getMonth() + 10)
  saveGoals([
    {
      id: genId('goal'),
      name: '家庭应急金',
      type: 'savings',
      targetAmount: 50000,
      targetDate: `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-01`,
      savedAmount: 16800
    },
    {
      id: genId('goal'),
      name: '旅行基金',
      type: 'savings',
      targetAmount: 12000,
      targetDate: todayStr(120),
      savedAmount: 3600
    }
  ])

  saveUser({ name: '我的家庭', createdAt: new Date().toISOString(), currency: 'CNY' })
  storage.setJSON(STORAGE_KEYS.seedFlag, true)
}
