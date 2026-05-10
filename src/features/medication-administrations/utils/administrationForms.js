export function createEmptyAdministrationActionForm() {
  return {
    administeredAt: "",
    notes: "",
    reason: "",
  };
}

export function createAdministrationActionForm(actionType, referenceDate = new Date()) {
  return {
    ...createEmptyAdministrationActionForm(),
    administeredAt:
      actionType === "administer" ? formatBrazilianDateTime(referenceDate) : "",
  };
}

export function createEmptyManualAdministrationForm() {
  return {
    notes: "",
    prescriptionId: "",
    residentId: "",
    scheduledAt: "",
  };
}

export function formatBrazilianDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    padDatePart(date.getDate()),
    padDatePart(date.getMonth() + 1),
    date.getFullYear(),
  ].join("/")
    + " "
    + [date.getHours(), date.getMinutes()].map(padDatePart).join(":");
}

export function parseBrazilianDateTime(value) {
  if (!value) {
    return null;
  }

  const match = value
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year, hour, minute] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hour) ||
    date.getMinutes() !== Number(minute)
  ) {
    return null;
  }

  return date;
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}
