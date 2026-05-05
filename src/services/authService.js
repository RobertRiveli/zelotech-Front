import { api } from "./api";
import { onlyNumbers } from "../utils/cpfFormatter";

export async function login(form) {
  const data = await api.post("/auth", {
    cpf: onlyNumbers(form.cpf),
    password: form.password,
  });

  return data.data;
}
