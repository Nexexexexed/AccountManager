import { defineStore } from "pinia";
import { computed, ref } from "vue";

interface Label {
  text: string;
}

export interface Account {
  id: number;
  labels: Label[];
  type: "LDAP" | "Локальная";
  login: string;
  password: string | null;
}

export const useAccountStore = defineStore("account", () => {
  const accounts = ref<Account[]>(
    JSON.parse(localStorage.getItem("accounts") || "[]")
  );
  const nextId = ref(
    accounts.value.length > 0
      ? Math.max(...accounts.value.map((a) => a.id)) + 1
      : 1
  );

  function addAccount(): Account {
    const newAccount: Account = {
      id: nextId.value++,
      labels: [],
      type: "Локальная",
      login: "",
      password: "",
    };
    accounts.value.push(newAccount);
    saveToLocalStorage();
    return newAccount;
  }

  function updateAccount(updateAccout: Account): void {
    const index = accounts.value.findIndex((a) => a.id === updateAccout.id);
    if (index !== -1) {
      accounts.value[index] = updateAccout;
      saveToLocalStorage();
    }
  }

  function deleteAccount(id: number): void {
    accounts.value = accounts.value.filter((a) => a.id !== id);
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem("accounts", JSON.stringify(accounts.value));
  }

  return {
    accounts: computed(() => accounts.value),
    addAccount,
    updateAccount,
    deleteAccount,
  };
});
