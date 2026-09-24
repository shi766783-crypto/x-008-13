<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h2>我的账户</h2>
        <p class="page-sub">统一管理家庭成员的资金账户</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">＋ 新建账户</button>
    </div>

    <div class="grid accounts-grid">
      <div v-for="acc in store.accounts" :key="acc.id" class="card account-card">
        <div class="account-top">
          <div>
            <div class="account-name">{{ acc.name }}</div>
            <span class="badge">{{ typeLabel(acc.type) }}</span>
          </div>
          <div class="account-action">
            <button class="link-btn" @click="openEdit(acc)">编辑</button>
            <button class="link-btn danger" @click="remove(acc)">删除</button>
          </div>
        </div>
        <div class="balance">¥{{ money(acc.balance) }}</div>
        <div class="account-foot">
          <span>初始余额 ¥{{ money(acc.initialBalance) }}</span>
          <span>{{ monthlyNet(acc.id) > 0 ? '+' : '' }}{{ money(monthlyNet(acc.id)) }} 本月</span>
        </div>
      </div>
    </div>

    <div class="card empty" v-if="store.accounts.length === 0">
      <p>还没有账户，点击右上角「新建账户」开始理财吧。</p>
    </div>

    <Modal :title="editing ? '编辑账户' : '新建账户'" @close="modalOpen = false" v-if="modalOpen">
      <form id="account-form" @submit.prevent="submit">
        <label class="field">
          <span>账户名称</span>
          <input v-model="form.name" required placeholder="如：工资卡" />
        </label>
        <label class="field">
          <span>账户类型</span>
          <div class="seg">
            <button v-for="t in ACCOUNT_TYPES" :key="t.value" type="button" class="seg-btn" :class="{ active: form.type === t.value }" @click="form.type = t.value">
              {{ t.label }}
            </button>
          </div>
        </label>
        <label class="field" v-if="!editing">
          <span>初始余额</span>
          <input v-model.number="form.initialBalance" type="number" step="0.01" placeholder="0.00" />
        </label>
      </form>

        <template #footer>
          <button type="button" class="btn" @click="modalOpen = false">取消</button>
          <button type="submit" class="btn btn-primary" form="account-form">保存</button>
        </template>
    </Modal>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useStore, refreshKeys, controllersApi } from '../data/store.js'
import { money } from '../core/utils.js'
import { ACCOUNT_TYPES, TRANSACTION_TYPES } from '../core/constants.js'
import Modal from '../components/Modal.vue'

const store = useStore()
const { account: accountApi } = controllersApi

const modalOpen = ref(false)
const editing = ref(null)
const form = reactive(accountApi.emptyAccountForm())

const typeLabel = (v) => ACCOUNT_TYPES.find((t) => t.value === v)?.label || v

const monthlyNet = (accountId) => {
  const month = new Date().toISOString().slice(0, 7)
  let net = 0
  for (const t of store.transactions) {
    if (!t.date.startsWith(month)) continue
    if (t.type === TRANSACTION_TYPES.INCOME && t.accountId === accountId) net += t.amount
    else if (t.type === TRANSACTION_TYPES.EXPENSE && t.accountId === accountId) net -= t.amount
    else if (t.type === TRANSACTION_TYPES.TRANSFER) {
      if (t.fromAccountId === accountId) net -= t.amount
      if (t.toAccountId === accountId) net += t.amount
    }
  }
  return net
}

const openCreate = () => {
  editing.value = null
  Object.assign(form, accountApi.emptyAccountForm())
  modalOpen.value = true
}

const openEdit = (acc) => {
  editing.value = acc
  Object.assign(form, { name: acc.name, type: acc.type, initialBalance: acc.initialBalance })
  modalOpen.value = true
}

const submit = () => {
  if (editing.value) accountApi.updateAccount(editing.value.id, form)
  else accountApi.addAccount(form)
  refreshKeys('accounts')
  modalOpen.value = false
}

const remove = (acc) => {
  if (accountApi.removeAccount(acc.id)) refreshKeys('accounts', 'transactions')
}
</script>

<style scoped>
.accounts-grid {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
.account-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.account-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.account-name {
  font-size: 16px;
  font-weight: 700;
}
.balance {
  font-size: 26px;
  font-weight: 800;
  color: var(--accent);
}
.account-foot {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}
.account-action {
  display: flex;
  gap: 8px;
}
</style>
