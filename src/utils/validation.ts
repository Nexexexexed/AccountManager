import type { Account, Label } from "../types";

export const parseLabels = (text: string): Label[] => {
  return text
    .split(";")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((text) => ({ text }));
};

export const serializeLabels = (labels: Label[]): string => {
  return labels.map((l) => l.text).join(";");
};

export const isAccountValid = (account: Account): boolean => {
  return (
    account.login.trim().length > 0 &&
    account.login.length <= 100 &&
    (account.type !== "Локальная" ||
      (!!account.password &&
        account.password.trim().length > 0 &&
        account.password.length <= 100))
  );
};
