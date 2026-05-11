import { onlyNumbers } from "@/shared/utils/cpfFormatter";

export function createEmptyResidentForm() {
  return {
    admissionDate: "",
    birthDate: "",
    bloodType: "",
    cpf: "",
    fullName: "",
    gender: "",
    status: "active",
  };
}

export function normalizeResidentPayload(form) {
  return {
    fullName: form.fullName.trim(),
    cpf: form.cpf ? onlyNumbers(form.cpf) : undefined,
    birthDate: formatDateForResidentApi(form.birthDate),
    gender: form.gender || undefined,
    bloodType: form.bloodType || undefined,
    admissionDate: formatDateForResidentApi(form.admissionDate),
    status: form.status || undefined,
  };
}

function formatDateForResidentApi(value) {
  if (!value) {
    return "";
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    return value;
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}-${month}-${year}`;
}
