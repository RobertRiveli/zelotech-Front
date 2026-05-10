import { calculateAge } from "@/shared/utils/dateFormatter";
import { normalizeText } from "@/shared/utils/textFormatter";

export function getAgeLabel(resident, currentTime) {
  const age = calculateAge(resident?.birthDate, currentTime);

  return age === null ? "Idade não informada" : `${age} anos`;
}

export function formatGender(value) {
  const normalized = normalizeText(value);
  const genderLabels = {
    female: "Feminino",
    feminino: "Feminino",
    male: "Masculino",
    masculino: "Masculino",
    other: "Outro",
    outro: "Outro",
  };

  if (!normalized) {
    return "Gênero não informado";
  }

  return genderLabels[normalized] ?? value;
}

export function getResidentStatusLabel(status) {
  const normalized = normalizeText(status);
  const statusLabelsByValue = {
    active: "Ativo",
    ativo: "Ativo",
    inactive: "Inativo",
    inativo: "Inativo",
  };

  if (!normalized) {
    return "Sem status";
  }

  return statusLabelsByValue[normalized] ?? status;
}

export function getResidentStatusTone(status) {
  const normalized = normalizeText(status);

  if (normalized === "active" || normalized === "ativo") {
    return "success";
  }

  if (normalized === "inactive" || normalized === "inativo") {
    return "muted";
  }

  return "pending";
}
