<template>
  <el-card
    :class="['account-card', { 'invalid-card': !isValid }]"
    shadow="never"
  >
    <div class="card-header">
      <el-tag :type="account.type === 'Локальная' ? 'primary' : 'success'">
        {{ account.type }}
      </el-tag>
      <el-button
        type="danger"
        icon="Close"
        circle
        plain
        @click="confirmDelete"
      />
    </div>

    <el-form label-position="top" @submit.prevent>
      <el-form-item label="Метка (необязательно):">
        <el-input
          v-model="labelsText"
          @blur="updateLabels"
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

      <el-form-item label="Тип записи:">
        <el-select
          v-model="account.type"
          @change="handleTypeChange"
          placeholder="Тип"
        >
          <el-option label="Локальная" value="Локальная" />
          <el-option label="LDAP" value="LDAP" />
        </el-select>
      </el-form-item>

      <el-form-item label="Логин:">
        <el-input
          v-model="account.login"
          @blur="emitUpdate"
          placeholder="user123"
          clearable
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item v-if="account.type === 'Локальная'" label="Пароль:">
        <el-input
          v-model="account.password"
          @blur="emitUpdate"
          show-password
          placeholder="Введите пароль"
          clearable
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <div class="form-status">
        <el-text v-if="!isValid" type="danger"
          >Заполните все обязательные поля</el-text
        >
        <el-text v-else type="success">Запись сохранена</el-text>
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessageBox } from "element-plus";
import type { Account } from "../types";
import {
  parseLabels,
  serializeLabels,
  isAccountValid,
} from "../utils/validation";

const props = defineProps<{ account: Account }>();
const emit = defineEmits<{
  (e: "update-account", account: Account): void;
  (e: "delete-account", id: number): void;
}>();

const labelsText = ref(serializeLabels(props.account.labels));
const isValid = computed(() => isAccountValid(props.account));

const updateLabels = () => {
  const updated = {
    ...props.account,
    labels: parseLabels(labelsText.value),
  };
  emit("update-account", updated);
};

const emitUpdate = () => {
  if (isValid.value) emit("update-account", props.account);
};

const handleTypeChange = () => {
  if (props.account.type === "LDAP") props.account.password = null;
  emitUpdate();
};

const confirmDelete = () => {
  ElMessageBox.confirm("Удалить учетную запись?", "Подтверждение", {
    confirmButtonText: "Удалить",
    cancelButtonText: "Отмена",
    type: "warning",
  }).then(() => emit("delete-account", props.account.id));
};
</script>

<style scoped>
.account-card {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 8px;
}

.invalid-card {
  border-left: 4px solid var(--el-color-error);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.form-status {
  margin-top: 10px;
  min-height: 24px;
}
</style>
