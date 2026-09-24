import { reactive } from 'vue'
import * as controllers from './controllers/index.js'

const store = reactive({
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  user: {},
  achievements: [],
  points: 0,
  claimedChallenges: []
})

const STORE_MAP = {
  accounts: () => controllers.account.loadAccounts(),
  transactions: () => controllers.transaction.loadTransactions(),
  budgets: () => controllers.budget.loadBudgets(),
  goals: () => controllers.savingsGoal.loadGoals(),
  user: () => controllers.user.loadUser(),
  achievements: () => controllers.achievement.loadAchievements(),
  points: () => controllers.challenge.getPoints(),
  claimedChallenges: () => controllers.challenge.loadClaimed()
}

export function refresh() {
  for (const [key, loader] of Object.entries(STORE_MAP)) {
    store[key] = loader()
  }
}

export function refreshKeys(...keys) {
  for (const key of keys) {
    if (STORE_MAP[key]) store[key] = STORE_MAP[key]()
  }
}

export function useStore() {
  return store
}

export const controllersApi = controllers
