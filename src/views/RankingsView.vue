<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h2>排行榜</h2>
        <p class="page-sub">和家庭一起进步，看得见的坚持</p>
      </div>
    </div>

    <div class="rank-grid">
      <div class="card rank-col">
        <h3 class="rank-title">🔥 记账坚持榜</h3>
        <p class="rank-sub">按连续记账天数排序</p>
        <div class="rank-list">
          <div v-for="(r, i) in streakList" :key="r.name" class="rank-item">
            <span class="rank-no" :class="{ top: i < 3 }">{{ i + 1 }}</span>
            <span class="rank-name">{{ r.name }}</span>
            <div class="rank-bar-track">
              <div class="rank-bar" :style="{ width: r.pct + '%' }"></div>
            </div>
            <span class="rank-val">{{ r.value }} 天</span>
          </div>
        </div>
      </div>

      <div class="card rank-col">
        <h3 class="rank-title">🐢 节约达人榜</h3>
        <p class="rank-sub">按储蓄率排序</p>
        <div class="rank-list">
          <div v-for="(r, i) in savingList" :key="r.name" class="rank-item">
            <span class="rank-no" :class="{ top: i < 3 }">{{ i + 1 }}</span>
            <span class="rank-name">{{ r.name }}</span>
            <div class="rank-bar-track">
              <div class="rank-bar saving" :style="{ width: r.pct + '%' }"></div>
            </div>
            <span class="rank-val">{{ r.value }}%</span>
          </div>
        </div>
        <div class="rank-empty" v-if="savingList.length === 0">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore, controllersApi } from '../data/store.js'

const store = useStore()
const { achievement } = controllersApi

const members = ['张先生', '李女士', '小家庭', '爸妈', '孩子']

const now = new Date()
const seed = now.getFullYear() * 100 + (now.getMonth() + 1)

function pseudoRandom(n) {
  return Math.abs(Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1
}

const streakList = computed(() => {
  const myStreak = achievement.computeCurrentStreak()
  const rows = members.map((name, i) => ({
    name,
    value: 12 + Math.floor(pseudoRandom(seed + i) * 40)
  }))
  rows.push({ name: '我们', value: myStreak })
  return rows
    .sort((a, b) => b.value - a.value)
    .map((r) => ({ ...r, pct: Math.min(100, Math.round((r.value / rows[0].value) * 100)) }))
})

const savingList = computed(() => {
  const { income, expense } = storeCurrentMonth()
  const myRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0
  const rows = members.map((name, i) => ({
    name,
    value: Math.max(0, Math.min(80, Math.round(pseudoRandom(seed * 3 + i) * 60 + 10)))
  }))
  rows.push({ name: '我们', value: Math.max(0, myRate) })
  return rows
    .sort((a, b) => b.value - a.value)
    .map((r) => ({ ...r, pct: Math.min(100, Math.round((r.value / rows[0].value) * 100)) }))
})

function storeCurrentMonth() {
  const month = new Date().toISOString().slice(0, 7)
  let income = 0
  let expense = 0
  for (const t of store.transactions) {
    if (!t.date.startsWith(month) || t.type === 'transfer') continue
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense }
}
</script>

<style scoped>
.rank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 14px;
}
.rank-title {
  margin: 0 0 2px;
  font-size: 16px;
}
.rank-sub {
  margin: 0 0 14px;
  font-size: 12px;
  color: var(--text-secondary);
}
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.rank-no {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  background: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}
.rank-no.top {
  background: var(--accent);
  color: #fff;
}
.rank-name {
  width: 52px;
  flex-shrink: 0;
  font-weight: 600;
}
.rank-bar-track {
  flex: 1;
  height: 10px;
  background: var(--bg-elevated);
  border-radius: 999px;
  overflow: hidden;
}
.rank-bar {
  height: 100%;
  background: linear-gradient(90deg, #f07d4f, #f9a54f);
  border-radius: 999px;
}
.rank-bar.saving {
  background: linear-gradient(90deg, #3aa66f, #57c785);
}
.rank-val {
  width: 52px;
  text-align: right;
  font-weight: 700;
  flex-shrink: 0;
}
.rank-empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 20px;
  font-size: 13px;
}
</style>
