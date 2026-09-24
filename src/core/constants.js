export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer'
}

export const ACCOUNT_TYPES = [
  { value: 'cash', label: '现金' },
  { value: 'bank', label: '银行卡' },
  { value: 'alipay', label: '支付宝' },
  { value: 'wechat', label: '微信' },
  { value: 'other', label: '其他' }
]

export const INCOME_CATEGORIES = ['工资', '兼职', '红包', '理财']

export const EXPENSE_CATEGORIES = ['餐饮', '交通', '购物', '住房', '医疗', '教育', '娱乐', '人情', '其他']

export const BUDGET_WARN_RATIO = 0.8

export const CHALLENGE_STREAKS = [7, 30]

export const DEFAULT_GOAL_TYPE = 'savings'

export const USER_ID = 'family'

export const STORAGE_KEYS = {
  accounts: 'ffm.accounts',
  transactions: 'ffm.transactions',
  budgets: 'ffm.budgets',
  savingsGoals: 'ffm.savingsGoals',
  user: 'ffm.user',
  achievements: 'ffm.achievements',
  points: 'ffm.points',
  claimedChallenges: 'ffm.claimedChallenges',
  seedFlag: 'ffm.seeded.v1'
}
