import { storage } from '../../core/storage.js'
import { STORAGE_KEYS, CHALLENGE_STREAKS } from '../../core/constants.js'
import { todayStr, daysBetween } from '../../core/utils.js'
import { loadTransactions } from './transactionController.js'
import { loadBudgets } from './budgetController.js'
import { loadGoals } from './savingsGoalController.js'
import { budgetView } from './statController.js'
import { incomeAndExpense } from './reportController.js'
import { TRANSACTION_TYPES } from '../../core/constants.js'

export const ACHIEVEMENTS = [
  { id: 'first_record', name: '首次记账', desc: '记下第一笔收支', icon: '📒' },
  { id: 'streak_7', name: '连续记账7天', desc: '连续 7 天每天至少记一笔', icon: '🔥' },
  { id: 'streak_30', name: '连续记账30天', desc: '连续 30 天每天至少记一笔', icon: '🚀' },
  { id: 'large_expense_guard', name: '大额支出卫士', desc: '记下一笔 1000 元以上的大额支出', icon: '🛡️' },
  { id: 'budget_master', name: '月度预算大师', desc: '某月全部预算类别均未超支', icon: '🎯' },
  { id: 'zero_overspend', name: '零超支月', desc: '连续 3 个月无任何类别超支', icon: '✅' },
  { id: 'saving_hero', name: '储蓄达人', desc: '任一储蓄目标进度达到 50%', icon: '💪' },
  { id: 'saving_complete', name: '储蓄目标达成', desc: '任一储蓄目标进度达到 100%', icon: '🏆' },
  { id: 'savings_rate_20', name: '稳健储蓄家', desc: '单月储蓄率达到 20%', icon: '🐢' },
  { id: 'savings_rate_50', name: '储蓄高手', desc: '单月储蓄率达到 50%', icon: '🦅' },
  { id: 'six_month_consistent', name: '记账六个月', desc: '累计记账达到 6 个月', icon: '📅' },
  { id: 'dream_chaser', name: '财务自由追梦人', desc: '累计记账满一年且储蓄目标达成', icon: '🌟' }
]

export function loadAchievements() {
  return storage.getJSON(STORAGE_KEYS.achievements) || []
}

export function saveAchievements(list) {
  storage.setJSON(STORAGE_KEYS.achievements, list)
}

export function awardAchievement(id) {
  const meta = ACHIEVEMENTS.find((a) => a.id === id)
  const list = loadAchievements()
  if (!meta || list.some((a) => a.id === id)) return
  list.push({ ...meta, earnedAt: Date.now() })
  saveAchievements(list)
}

export function computeCurrentStreak() {
  const days = new Set(loadTransactions().map((t) => t.date))
  let streak = 0
  for (let i = 0; i < 365; i++) {
    if (days.has(todayStr(-i))) streak++
    else break
  }
  return streak
}

export function distinctRecordedMonths() {
  return new Set(loadTransactions().map((t) => t.date.slice(0, 7))).size
}

export function largestExpense() {
  return loadTransactions()
    .filter((t) => t.type === TRANSACTION_TYPES.EXPENSE)
    .reduce((max, t) => Math.max(max, t.amount), 0)
}

export function updateAchievements() {
  const now = todayStr()
  const days = new Set(loadTransactions().map((t) => t.date))
  const streak = computeCurrentStreak()
  const month = now.slice(0, 7)
  const lastMonth = now.slice(0, 4) + '-' + String(Number(now.slice(5, 7)) - 1).padStart(2, '0')

  if (loadTransactions().length > 0) awardAchievement('first_record')
  if (streak >= 7) awardAchievement('streak_7')
  if (streak >= 30) awardAchievement('streak_30')
  if (largestExpense() >= 1000) awardAchievement('large_expense_guard')

  const views = budgetView(month)
  if (views.length && views.every((v) => v.percent <= 100)) awardAchievement('budget_master')

  const overspent = (m) => budgetView(m).some((v) => v.percent > 100)
  const three = [now.slice(0, 4) + '-' + String(Number(now.slice(5, 7)) - 2).padStart(2, '0'), lastMonth, month]
  if (three.every((m) => loadBudgets().some((b) => b.month === m) && !overspent(m))) awardAchievement('zero_overspend')

  const goals = loadGoals()
  if (goals.some((g) => g.targetAmount && g.savedAmount / g.targetAmount >= 0.5)) awardAchievement('saving_hero')
  if (goals.some((g) => g.targetAmount && g.savedAmount / g.targetAmount >= 1)) awardAchievement('saving_complete')

  const { income, expense } = incomeAndExpense(month)
  const rate = income > 0 ? (income - expense) / income : 0
  if (rate >= 0.2) awardAchievement('savings_rate_20')
  if (rate >= 0.5) awardAchievement('savings_rate_50')

  if (distinctRecordedMonths() >= 6) awardAchievement('six_month_consistent')
  const yearOk = daysBetween(`${now.slice(0, 4)}-01-01`, now) >= 365 && goals.some((g) => g.targetAmount && g.savedAmount / g.targetAmount >= 1)
  if (yearOk) awardAchievement('dream_chaser')
}
