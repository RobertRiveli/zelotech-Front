import { api } from "@/shared/api/client";
import { onlyNumbers } from "@/shared/utils/cpfFormatter";

export async function login(form) {
  const data = await api.post("/auth", {
    cpf: onlyNumbers(form.cpf),
    password: form.password,
  });

  return data.data;
}
