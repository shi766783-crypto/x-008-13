<template>
  <Teleport to="body">
    <div class="modal-mask" @click.self="close">
      <div class="modal-card" role="dialog" :aria-label="title">
        <div class="modal-head">
          <h3>{{ title }}</h3>
          <button class="icon-btn" @click="close" aria-label="关闭">✕</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-foot" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' }
})
const emit = defineEmits(['close'])
const close = () => emit('close')
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}
.modal-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
  animation: modal-in 0.18s ease;
}
@keyframes modal-in {
  from { transform: translateY(14px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
}
.modal-head h3 {
  margin: 0;
  font-size: 16px;
}
.modal-body {
  padding: 12px 20px;
  overflow-y: auto;
}
.modal-foot {
  padding: 12px 20px 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
