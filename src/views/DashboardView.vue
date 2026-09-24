<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h2>财务看板</h2>
        <p class="page-sub">{{ monthLabel(currentMonth) }} 收支概览</p>
      </div>
    </div>

    <div class="kpis">
      <div class="card kpi">
        <span class="kpi-label">本月总收入</span>
        <b class="kpi-value income">¥{{ money(income) }}</b>
      </div>
      <div class="card kpi">
        <span class="kpi-label">本月总支出</span>
        <b class="kpi-value expense">¥{{ money(expense) }}</b>
      </div>
      <div class="card kpi">
        <span class="kpi-label">本月结余</span>
        <b class="kpi-value" :class="{ neg: balance < 0 }">¥{{ money(balance) }}</b>
      </div>
      <div class="card kpi">
        <span class="kpi-label">储蓄率</span>
        <b class="kpi-value accent">{{ savingsRate }}%</b>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card chart-card">
        <h3 class="card-title">各类别支出占比</h3>
        <div class="pie-layout">
          <PieChart :data="pieData" center-text="支出占比" />
          <div class="legend">
            <div v-for="(d, i) in pieData" :key="d.category" class="legend-row">
              <span class="legend-dot" :style="{ background: palette[i % palette.length] }"></span>
              <span class="legend-name">{{ d.category }}</span>
              <span class="legend-val">{{ d.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card chart-card">
        <h3 class="card-title">近 6 个月收支趋势</h3>
        <div class="chart-scroll">
          <BarChart :items="trendData" />
        </div>
        <div class="chart-legend">
          <span class="legend-dot income-dot"></span>收入
          <span class="legend-dot expense-dot"></span>支出
        </div>
      </div>
    </div>

    <div class="card empty" v-if="pieData.length === 0">
      <p>本月还没有支出记录，去「记账」页面记一笔吧。</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore, controllersApi } from '../data/store.js'
import { money, monthListFrom, monthLabel } from '../core/utils.js'
import PieChart from '../components/PieChart.vue'
import BarChart from '../components/BarChart.vue'

const store = useStore()
const { report } = controllersApi
const palette = ['#4f8df9', '#f9a54f', '#57c785', '#f45b69', '#936df0', '#f0c957', '#4fc3f7', '#ec6aa7', '#8bc34a']

const currentMonth = computed(() => new Date().toISOString().slice(0, 7))

const stats = computed(() => report.incomeAndExpense(currentMonth.value))
const income = computed(() => stats.value.income)
const expense = computed(() => stats.value.expense)
const balance = computed(() => stats.value.balance)
const savingsRate = computed(() => report.savingsRate(income.value, expense.value))

const pieData = computed(() => {
  const rows = report.expenseByCategory(currentMonth.value)
  const total = rows.reduce((s, r) => s + r.amount, 0) || 1
  return rows.map((r) => ({ ...r, percent: Math.round((r.amount / total) * 100) }))
})

const trendData = computed(() => {
  const months = monthListFrom(5)
  return report.monthlySeries(months).flatMap((m) => [
    { label: `${Number(m.month.slice(5))}月`, value: m.income },
    { label: '', value: m.expense }
  ])
})
</script>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
@media (max-width: 720px) {
  .kpis { grid-template-columns: repeat(2, 1fr); }
}
.kpi {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.kpi-label {
  font-size: 12px;
  color: var(--text-secondary);
}
.kpi-value {
  font-size: 24px;
  font-weight: 800;
}
.kpi-value.income { color: var(--income); }
.kpi-value.expense { color: var(--expense); }
.kpi-value.neg { color: var(--expense); }
.kpi-value.accent { color: var(--accent); }
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 860px) {
  .charts-grid { grid-template-columns: 1fr; }
}
.card-title {
  margin: 0 0 12px;
  font-size: 15px;
}
.pie-layout {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.legend {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}
.legend-name { flex: 1; color: var(--text-secondary); }
.legend-val { font-weight: 700; }
.chart-scroll {
  overflow-x: auto;
}
.chart-scroll > :deep(.chart-wrap) {
  min-width: 420px;
}
.chart-legend {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}
.income-dot { background: #4f8df9; }
.expense-dot { background: #f9a54f; }
</style>
