<template>
  <div class="account-manager">
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="header-content">
          <h2 class="title">Управление учетными записями</h2>
          <el-button
            type="primary"
            @click="addAccount"
            icon="Plus"
            class="add-button"
          >
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
        <el-card
          v-for="account in accounts"
          :key="account.id"
          shadow="never"
          class="account-card"
          :class="{ 'invalid-card': !isAccountValid(account) }"
        >
          <div class="card-header">
            <el-tag
              :type="account.type === 'Локальная' ? 'primary' : 'success'"
            >
              {{ account.type }}
            </el-tag>
            <el-button
              type="danger"
              @click="confirmDelete(account.id)"
              icon="Close"
              circle
              plain
            />
          </div>

          <el-form :model="account" label-position="top" @submit.prevent>
            <el-form-item
              label="Метка (необязательно):"
              :rules="[
                { max: 50, message: 'Максимум 50 символов', trigger: 'blur' },
              ]"
            >
              <el-input
                v-model="accountLabels[account.id]"
                @blur="updateLabels(account)"
                placeholder="admin;test;demo"
                clearable
                maxlength="50"
                show-word-limit
              >
                <template #append>
                  <el-tooltip content="Разделяйте метки точкой с запятой">
                    <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item
              label="Тип записи:"
              :rules="[{ required: true, message: 'Выберите тип записи' }]"
            >
              <el-select
                v-model="account.type"
                @change="handleTypeChange(account)"
                placeholder="Выберите тип"
                style="width: 100%"
              >
                <el-option label="Локальная" value="Локальная" />
                <el-option label="LDAP" value="LDAP" />
              </el-select>
            </el-form-item>

            <el-form-item
              label="Логин:"
              :rules="[
                { required: true, message: 'Логин обязателен' },
                { max: 100, message: 'Максимум 100 символов' },
              ]"
              :prop="'login'"
            >
              <el-input
                v-model="account.login"
                @blur="validateAndSave(account)"
                placeholder="user123"
                clearable
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <el-form-item
              v-if="account.type === 'Локальная'"
              label="Пароль:"
              :rules="[
                { required: true, message: 'Пароль обязателен' },
                { max: 100, message: 'Максимум 100 символов' },
              ]"
              :prop="'password'"
            >
              <el-input
                v-model="account.password"
                @blur="validateAndSave(account)"
                placeholder="Введите пароль"
                show-password
                clearable
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <div class="form-status">
              <el-text
                v-if="!isAccountValid(account)"
                type="danger"
                class="status-message"
              >
                Заполните все обязательные поля
              </el-text>
              <el-text v-else type="success" class="status-message">
                Запись сохранена
              </el-text>
            </div>
          </el-form>
        </el-card>
      </transition-group>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAccountStore } from "../stores/AccountStore";
import { ElMessageBox } from "element-plus";
import type { Account } from "../stores/AccountStore";

const accountStore = useAccountStore();
const accountLabels = ref<Record<number, string>>({});

const accounts = computed(() => accountStore.accounts);

onMounted(() => {
  accounts.value.forEach((account) => {
    accountLabels.value[account.id] = account.labels
      .map((l) => l.text)
      .join(";");
  });
});

const addAccount = () => {
  const newAccount = accountStore.addAccount();
  accountLabels.value[newAccount.id] = "";
};

const updateLabels = (account: Account) => {
  const labels =
    accountLabels.value[account.id]
      ?.split(";")
      .filter((text) => text.trim())
      .map((text) => ({ text: text.trim() })) || [];

  accountStore.updateAccount({
    ...account,
    labels,
  });
};

const handleTypeChange = (account: Account) => {
  if (account.type === "LDAP") {
    account.password = null;
  }
  validateAndSave(account);
};

const validateAndSave = (account: Account) => {
  if (isAccountValid(account)) {
    accountStore.updateAccount(account);
  }
};

const isAccountValid = (account: Account): boolean => {
  return isLoginValid(account) && isPasswordValid(account);
};

const isLoginValid = (account: Account): boolean => {
  return account.login.trim().length > 0 && account.login.length <= 100;
};

const isPasswordValid = (account: Account): boolean => {
  return (
    account.type !== "Локальная" ||
    (account.password !== null &&
      account.password.trim().length > 0 &&
      account.password.length <= 100)
  );
};

const confirmDelete = (id: number) => {
  ElMessageBox.confirm(
    "Вы уверены, что хотите удалить эту учетную запись?",
    "Подтверждение удаления",
    {
      confirmButtonText: "Удалить",
      cancelButtonText: "Отмена",
      type: "warning",
    }
  )
    .then(() => {
      deleteAccount(id);
    })
    .catch(() => {});
};

const deleteAccount = (id: number) => {
  accountStore.deleteAccount(id);
  delete accountLabels.value[id];
};
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

.account-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
  position: relative;
  padding: 20px;
  border-radius: 8px;
}

.invalid-card {
  border-left: 4px solid var(--el-color-error);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.form-status {
  margin-top: 10px;
  min-height: 24px;
}

.status-message {
  font-size: 0.9rem;
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
