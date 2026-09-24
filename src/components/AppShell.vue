<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="brand">
        <span class="brand-logo">家</span>
        <div>
          <div class="brand-name">家庭财务管家</div>
          <div class="brand-sub">记账 · 预算 · 储蓄</div>
        </div>
      </div>
      <nav class="nav">
        <button v-for="item in NAV" :key="item.key" class="nav-item" :class="{ active: tab === item.key }" @click="go(item.key)">
          <IconChart :name="item.icon" />
          <span>{{ item.label }}</span>
        </button>
      </nav>
      <div class="sidebar-foot">
        <div class="points">🏅 {{ store.points }} 积分</div>
      </div>
    </aside>
    <div class="mask" :class="{ show: sidebarOpen }" @click="sidebarOpen = false"></div>

    <main class="main">
      <header class="topbar">
        <button class="hamburger" @click="sidebarOpen = !sidebarOpen" aria-label="菜单">☰</button>
        <div class="topbar-title">{{ currentLabel }}</div>
        <div class="topbar-right">
          <button class="icon-btn" @click="resetAll" title="重置数据">⟳</button>
        </div>
      </header>
      <component :is="currentView" />
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore, refresh, controllersApi } from '../data/store.js'
import IconChart from './IconChart.vue'
import DashboardView from '../views/DashboardView.vue'
import AccountsView from '../views/AccountsView.vue'
import TransactionsView from '../views/TransactionsView.vue'
import BudgetView from '../views/BudgetView.vue'
import SavingsGoalsView from '../views/SavingsGoalsView.vue'
import ChallengesView from '../views/ChallengesView.vue'
import RankingsView from '../views/RankingsView.vue'
import ProfileView from '../views/ProfileView.vue'

const NAV = [
  { key: 'dashboard', label: '财务看板', icon: 'chart' },
  { key: 'accounts', label: '我的账户', icon: 'account' },
  { key: 'transactions', label: '记账', icon: 'add' },
  { key: 'budget', label: '月度预算', icon: 'target' },
  { key: 'goals', label: '储蓄目标', icon: 'list' },
  { key: 'challenges', label: '记账挑战', icon: 'trophy' },
  { key: 'rankings', label: '排行榜', icon: 'chart' },
  { key: 'profile', label: '个人中心', icon: 'user' }
]

const VIEWS = {
  dashboard: DashboardView,
  accounts: AccountsView,
  transactions: TransactionsView,
  budget: BudgetView,
  goals: SavingsGoalsView,
  challenges: ChallengesView,
  rankings: RankingsView,
  profile: ProfileView
}

export default {
  components: { IconChart, ...VIEWS },
  setup() {
    const store = useStore()
    const tab = ref('dashboard')
    const sidebarOpen = ref(false)

    refresh()
    controllersApi.achievement.updateAchievements()
    refresh()

    const currentView = computed(() => VIEWS[tab.value])
    const currentLabel = computed(() => NAV.find((n) => n.key === tab.value)?.label || '')
    const go = (key) => {
      tab.value = key
      sidebarOpen.value = false
    }
    const resetAll = () => {
      if (!confirm('确认清除全部本地数据并重置为演示数据？')) return
      localStorage.clear()
      controllersApi.seed.seedDemoData()
      refresh()
    }
    return { store, tab, sidebarOpen, NAV, currentView, currentLabel, go, resetAll }
  }
}
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 224px;
  flex-shrink: 0;
  background: var(--sidebar-bg);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  padding: 20px 14px;
  position: sticky;
  top: 0;
  height: 100vh;
  border-right: 1px solid var(--border-color);
  z-index: 30;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 18px;
}
.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f8df9, #936df0);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
}
.brand-name { font-weight: 800; font-size: 15px; }
.brand-sub { font-size: 11px; color: var(--text-secondary); }
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover { background: var(--bg-elevated); color: var(--text-primary); }
.nav-item.active {
  background: rgba(79, 141, 249, 0.14);
  color: var(--accent);
}
.sidebar-foot {
  padding: 10px 12px 0;
  font-size: 13px;
  color: var(--text-secondary);
}
.main {
  flex: 1;
  min-width: 0;
  background: var(--bg-body);
}
.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  background: var(--bg-body);
  z-index: 20;
}
.topbar-title {
  font-size: 15px;
  font-weight: 700;
  flex: 1;
}
.topbar-right { display: flex; gap: 8px; }
.hamburger {
  display: none;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-primary);
  padding: 4px 8px;
}
.mask {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 25;
}
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    height: 100vh;
  }
  .sidebar.open { transform: translateX(0); }
  .hamburger { display: block; }
  .mask.show { display: block; }
}
</style>
