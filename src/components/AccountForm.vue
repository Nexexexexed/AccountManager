<template>
  <div class="account-manager">
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="header-content">
          <h2 class="title">Управление учетными записями</h2>
          <el-button type="primary" @click="addAccount" icon="Plus">
            Добавить учетную запись
          </el-button>
        </div>
      </template>

      <el-empty
        v-if="accounts.length === 0"
        description="Нет учетных записей"
        :image-size="200"
      />

      <transition-group name="list" tag="div">
        <AccountCard
          v-for="account in accounts"
          :key="account.id"
          :account="account"
          @delete-account="deleteAccount"
          @update-account="updateAccount"
        />
      </transition-group>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAccountStore } from "../stores/AccountStore";
import AccountCard from "./AccountCard.vue";

const store = useAccountStore();
const accounts = computed(() => store.accounts);

const addAccount = () => store.addAccount();
const deleteAccount = (id: number) => store.deleteAccount(id);
const updateAccount = (account) => store.updateAccount(account);
</script>

<style scoped>
.account-manager {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;
}

.main-card {
  border-radius: 8px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.title {
  margin: 0;
  font-size: 1.5rem;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
