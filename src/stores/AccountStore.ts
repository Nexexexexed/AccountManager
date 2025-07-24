import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import type { Account, Label } from "../types.ts";
import { debounce } from "lodash-es";

const STORAGE_KEY = "accounts";

export const useAccountStore = defineStore("account", () => {
  const accounts = ref<Account[]>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  );

  const nextId = ref(
    accounts.value.length > 0
      ? Math.max(...accounts.value.map((a) => a.id)) + 1
      : 1
  );

  const addAccount = (): Account => {
    const newAccount: Account = {
      id: nextId.value++,
      labels: [],
      type: "Локальная",
      login: "",
      password: "",
    };
    accounts.value.push(newAccount);
    return newAccount;
  };

  const updateAccount = (account: Account) => {
    const index = accounts.value.findIndex((a) => a.id === account.id);
    if (index !== -1) {
      accounts.value[index] = account;
    }
  };

  const deleteAccount = (id: number) => {
    accounts.value = accounts.value.filter((a) => a.id !== id);
  };

  const saveToLocalStorage = debounce(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts.value));
  }, 300);

  watch(accounts, saveToLocalStorage, { deep: true });

  return {
    accounts: computed(() => accounts.value),
    addAccount,
    updateAccount,
    deleteAccount,
  };
});
