<template>
  <div class="chart-wrap">
    <div v-for="(item, index) in bars" :key="index" class="bar-group">
      <div class="bar-label">{{ item.label }}</div>
      <div class="bar-track">
        <div class="bar-fill" :style="{ height: item.height + '%' }">
          <span v-if="showValue" class="bar-value">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  showValue: { type: Boolean, default: true }
})

const bars = computed(() => {
  const max = Math.max(...props.items.map((i) => Number(i.value) || 0), 1)
  return props.items.map((item) => ({
    ...item,
    height: Math.max(2, Math.round(((Number(item.value) || 0) / max) * 100))
  }))
})
</script>

<style scoped>
.chart-wrap {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  height: 220px;
  padding: 12px 8px 4px;
}
.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
}
.bar-label {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 6px;
  white-space: nowrap;
}
.bar-track {
  flex: 1;
  display: flex;
  align-items: flex-end;
  background: var(--bg-elevated);
  border-radius: 8px;
  overflow: hidden;
}
.bar-fill {
  width: 100%;
  position: relative;
  background: linear-gradient(180deg, #4f8df9, #2f6fe4);
  border-radius: 8px 8px 0 0;
  transition: height 0.35s ease;
  min-height: 2px;
}
.bar-value {
  position: absolute;
  top: 4px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  white-space: nowrap;
}
</style>
