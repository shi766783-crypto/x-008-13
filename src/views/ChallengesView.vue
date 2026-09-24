<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h2>记账挑战</h2>
        <p class="page-sub">坚持记账，赢取积分与成就徽章</p>
      </div>
      <div class="points-pill">🏅 积分 {{ store.points }}</div>
    </div>

    <div class="card streak-card">
      <div class="streak-big">
        <span class="streak-num">{{ streak }}</span>
        <span class="streak-unit">天连续记账</span>
      </div>
      <div class="streak-dots">
        <div v-for="(s, i) in last7" :key="i" class="dot" :class="{ on: s }" :title="dateOf(i)"><span v-if="s" class="dot-check">✓</span></div>
      </div>
    </div>

    <h3 class="block-title">进行中的挑战</h3>
    <div class="challenge-list">
      <div v-for="c in challenges" :key="c.days" class="card challenge-item">
        <div class="challenge-head">
          <span class="challenge-name">连续记账 {{ c.days }} 天</span>
          <span class="badge" :class="{ done: c.completed }">{{ c.completed ? '已达成' : '进行中' }}</span>
        </div>
        <div class="bar-track">
          <div class="bar" :style="{ width: (c.progress / c.days) * 100 + '%' }"></div>
        </div>
        <div class="challenge-foot">
          <span>{{ c.progress }} / {{ c.days }} 天</span>
          <button class="btn btn-primary sm" :disabled="!c.completed || isClaimed(c.days)" @click="claim(c.days)">
            {{ isClaimed(c.days) ? '已领取' : c.completed ? '领取 +50 积分' : '未达成' }}
          </button>
        </div>
      </div>
    </div>

    <h3 class="block-title">成就徽章</h3>
    <div class="badges-grid">
      <div v-for="a in achievementsMeta" :key="a.id" class="badge-card card" :class="{ locked: !has(a.id) }">
        <div class="badge-icon">{{ a.icon }}</div>
        <div class="badge-name">{{ a.name }}</div>
        <div class="badge-desc">{{ a.desc }}</div>
        <div class="badge-state">{{ has(a.id) ? '✅ 已获得' : '🔒 未解锁' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore, refreshKeys, controllersApi } from '../data/store.js'
import { todayStr } from '../core/utils.js'

const store = useStore()
const { achievement, challenge } = controllersApi

const streak = computed(() => achievement.computeCurrentStreak())
const challenges = computed(() => challenge.challengeViews())
const achievementsMeta = computed(() => achievement.ACHIEVEMENTS)
const earned = computed(() => new Set(store.achievements.map((a) => a.id)))
const has = (id) => earned.value.has(id)
const claimed = computed(() => store.claimedChallenges || [])
const isClaimed = (days) => claimed.value.includes(days)

const last7 = computed(() => {
  const days = new Set(store.transactions.map((t) => t.date))
  return Array.from({ length: 7 }, (_, i) => days.has(todayStr(6 - i)))
})
const dateOf = (i) => {
  const d = new Date()
  d.setDate(d.getDate() - (6 - i))
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const claim = (days) => {
  if (challenge.claimChallenge(days)) refreshKeys('points', 'achievements', 'claimedChallenges')
}
</script>

<style scoped>
.page-head { align-items: flex-start; }
.points-pill {
  background: linear-gradient(135deg, #f0c957, #e89b2d);
  color: #3d2c00;
  font-weight: 800;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 14px;
}
.streak-card {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}
.streak-big {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.streak-num {
  font-size: 44px;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
}
.streak-unit {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 6px;
}
.streak-dots {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
  flex-wrap: wrap;
}
.dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
}
.dot.on {
  background: var(--accent);
  border-color: var(--accent);
}
.block-title {
  font-size: 15px;
  margin: 8px 0 12px;
}
.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.challenge-item {
  padding: 16px;
}
.challenge-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.challenge-name {
  font-weight: 700;
  font-size: 15px;
}
.bar-track {
  height: 10px;
  background: var(--bg-elevated);
  border-radius: 999px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: linear-gradient(90deg, #f0c957, #e89b2d);
  border-radius: 999px;
  transition: width 0.3s;
}
.challenge-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 13px;
  color: var(--text-secondary);
}
.btn.sm { padding: 6px 12px; font-size: 12px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.badge-card {
  text-align: center;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.badge-icon {
  font-size: 34px;
}
.badge-name {
  font-weight: 700;
  font-size: 14px;
}
.badge-desc {
  font-size: 11px;
  color: var(--text-secondary);
  min-height: 30px;
  line-height: 1.4;
}
.badge-state {
  font-size: 11px;
  color: var(--accent);
}
.badge-card.locked .badge-icon,
.badge-card.locked .badge-name {
  filter: grayscale(1);
  opacity: 0.55;
}
</style>
