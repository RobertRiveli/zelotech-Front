import { normalizeText } from "../../../utils/textFormatter";
import { getMedicationName, toDate } from "./dashboardFormatters";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const prescriptionFilters = [
  { id: "all", label: "Todas" },
  { id: "ending", label: "Encerrando" },
  { id: "open", label: "Sem data final" },
  { id: "today", label: "Primeiro horário hoje" },
];

export function buildPrescriptionStats(prescriptions, currentTime) {
  const endingSoon = prescriptions.filter((prescription) =>
    isPrescriptionEndingSoon(prescription, currentTime),
  );
  const withoutEndDate = prescriptions.filter((prescription) => !prescription.endDate);
  const firstScheduledToday = prescriptions.filter((prescription) =>
    isFirstScheduledToday(prescription, currentTime),
  );

  return {
    active: prescriptions.length,
    endingSoon: endingSoon.length,
    firstScheduledToday: firstScheduledToday.length,
    withoutEndDate: withoutEndDate.length,
  };
}

export function filterPrescriptions(
  prescriptions,
  { currentTime, filterId, searchTerm },
) {
  const normalizedSearch = normalizeText(searchTerm);

  return prescriptions.filter((prescription) => {
    const matchesFilter = matchPrescriptionFilter(
      prescription,
      filterId,
      currentTime,
    );

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [
      prescription.resident?.fullName,
      getMedicationName(prescription.medication),
      prescription.frequency,
      prescription.route,
      prescription.prescribedBy,
    ].some((value) => normalizeText(value).includes(normalizedSearch));
  });
}

export function getPrescriptionStatus(prescription, currentTime) {
  if (isPrescriptionEndingSoon(prescription, currentTime)) {
    return {
      label: "Encerrando",
      tone: "warning",
    };
  }

  if (!prescription.endDate) {
    return {
      label: "Sem data final",
      tone: "muted",
    };
  }

  return {
    label: "Ativa",
    tone: "success",
  };
}

export function isPrescriptionEndingSoon(prescription, currentTime) {
  const endDate = toDate(prescription.endDate);

  if (!endDate || currentTime <= 0) {
    return false;
  }

  const now = new Date(currentTime);
  const sevenDaysFromNow = new Date(now.getTime() + SEVEN_DAYS_MS);

  return endDate >= now && endDate <= sevenDaysFromNow;
}

export function isFirstScheduledToday(prescription, currentTime) {
  const scheduledAt = toDate(prescription.firstScheduledAt);

  if (!scheduledAt || currentTime <= 0) {
    return false;
  }

  const reference = new Date(currentTime);

  return (
    scheduledAt.getFullYear() === reference.getFullYear() &&
    scheduledAt.getMonth() === reference.getMonth() &&
    scheduledAt.getDate() === reference.getDate()
  );
}

function matchPrescriptionFilter(prescription, filterId, currentTime) {
  if (filterId === "ending") {
    return isPrescriptionEndingSoon(prescription, currentTime);
  }

  if (filterId === "open") {
    return !prescription.endDate;
  }

  if (filterId === "today") {
    return isFirstScheduledToday(prescription, currentTime);
  }

  return true;
}
