import { formatCpf, onlyNumbers } from "@/shared/utils/cpfFormatter";
import { formatDateInput } from "@/shared/utils/dateFormatter";
import { normalizeText } from "@/shared/utils/textFormatter";

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
    gender: normalizeGenderForApi(form.gender),
    bloodType: form.bloodType || undefined,
    admissionDate: formatDateForResidentApi(form.admissionDate),
    status: form.status || undefined,
  };
}

export function createResidentFormFromResident(resident) {
  return {
    admissionDate: formatDateInput(resident?.admissionDate),
    birthDate: formatDateInput(resident?.birthDate),
    bloodType: resident?.bloodType ?? "",
    cpf: resident?.cpf ? formatCpf(onlyNumbers(resident.cpf)) : "",
    fullName: resident?.fullName ?? "",
    gender: normalizeGenderForForm(resident?.gender),
    status: resident?.status ?? "active",
  };
}

function normalizeGenderForApi(value) {
  const normalized = normalizeText(value);
  const genderValues = {
    f: "F",
    female: "F",
    feminino: "F",
    m: "M",
    male: "M",
    masculino: "M",
    other: "other",
    outro: "other",
  };

  return genderValues[normalized] ?? undefined;
}

function normalizeGenderForForm(value) {
  return normalizeGenderForApi(value) ?? "";
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
