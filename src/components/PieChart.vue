<template>
  <div class="pie-wrap">
    <div class="pie" :style="pieStyle"></div>
    <div class="pie-center" v-if="centerText">
      <div class="pie-center-label">{{ centerText }}</div>
      <div class="pie-center-sub" v-if="centerSub">{{ centerSub }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  centerText: { type: String, default: '' },
  centerSub: { type: String, default: '' }
})

const PALETTE = ['#4f8df9', '#f9a54f', '#57c785', '#f45b69', '#936df0', '#f0c957', '#4fc3f7', '#ec6aa7', '#8bc34a']

const pieStyle = computed(() => {
  const total = props.data.reduce((s, d) => s + Number(d.value || 0), 0)
  if (!total) return { background: 'var(--bg-elevated)', opacity: 0.4 }
  let acc = 0
  const segments = props.data.map((d, i) => {
    const from = (acc / total) * 360
    acc += Number(d.value || 0)
    const to = (acc / total) * 360
    return `${PALETTE[i % PALETTE.length]} ${from}deg ${to}deg`
  })
  return { background: `conic-gradient(${segments.join(',')})` }
})
</script>

<style scoped>
.pie-wrap {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto;
}
.pie {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.pie-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--card-bg);
  margin: 34px;
  text-align: center;
}
.pie-center-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  word-break: break-all;
}
.pie-center-sub {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
  max-width: 70px;
  word-break: break-all;
}
</style>
