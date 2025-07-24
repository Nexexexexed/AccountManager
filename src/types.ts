export interface Label {
  text: string;
}

export interface Account {
  id: number;
  labels: Label[];
  type: "LDAP" | "Локальная";
  login: string;
  password: string | null;
}
