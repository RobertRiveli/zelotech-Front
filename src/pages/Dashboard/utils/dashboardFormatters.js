import { formatCpf } from "../../../utils/cpfFormatter";
import {
  calculateAge,
  formatDate,
  formatDateInput,
  formatDateRange,
  formatDateTime,
  formatLocalDateInput,
  formatShortDate,
  formatShortDateTime,
  formatTime,
  formatTimeInput,
  toDate,
} from "../../../utils/dateFormatter";
import { normalizeText } from "../../../utils/textFormatter";

export {
  calculateAge,
  formatCpf,
  formatDate,
  formatDateInput,
  formatDateRange,
  formatDateTime,
  formatLocalDateInput,
  formatShortDate,
  formatShortDateTime,
  formatTime,
  formatTimeInput,
  toDate,
};

export function getMedicationName(medication) {
  if (!medication) {
    return "Medicamento";
  }

  return medication.brandName
    ? `${medication.genericName} (${medication.brandName})`
    : medication.genericName;
}

export function getDosage(administration) {
  const dosage = administration.prescription?.dosage;
  const abbreviation = administration.measurementUnit?.abbreviation;

  return [dosage, abbreviation].filter(Boolean).join(" ") || "Dose registrada";
}

export function getInitials(displayName) {
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

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

export function formatPrescriptionDosage(prescription) {
  const dosage = prescription.dosage;
  const abbreviation = prescription.measurementUnit?.abbreviation;
  const route = prescription.route;

  return [dosage, abbreviation, route].filter(Boolean).join(" ") || "Dose registrada";
}
