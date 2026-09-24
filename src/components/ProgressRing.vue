<template>
  <svg :width="size" :height="size" class="ring" :style="{ transform: `rotate(-90deg)` }">
    <circle :cx="size / 2" :cy="size / 2" :r="radius" fill="none" :stroke="trackColor" :stroke-width="strokeWidth" />
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
      fill="none"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="dashOffset"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percent: { type: Number, default: 0 },
  size: { type: Number, default: 140 },
  strokeWidth: { type: Number, default: 14 },
  trackColor: { type: String, default: 'var(--border-color)' },
  colorOk: { type: String, default: '#57c785' },
  colorWarn: { type: String, default: '#f0c957' },
  colorDanger: { type: String, default: '#f45b69' }
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - Math.min(100, Math.max(0, props.percent)) / 100))
const strokeColor = computed(() =>
  props.percent >= 100 ? props.colorDanger : props.percent >= 80 ? props.colorWarn : props.colorOk
)
</script>

<style scoped>
.ring {
  display: block;
}
</style>
