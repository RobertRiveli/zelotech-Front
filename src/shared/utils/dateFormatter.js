export function toDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function calculateAge(birthDate, referenceDate = new Date()) {
  const birth = toDate(birthDate);
  const reference = toDate(referenceDate) ?? new Date();

  if (!birth) {
    return null;
  }

  let age = reference.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    reference.getMonth() > birth.getMonth() ||
    (reference.getMonth() === birth.getMonth() &&
      reference.getDate() >= birth.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

export function formatTime(value) {
  const date = toDate(value);

  if (!date) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(value) {
  const date = toDate(value);

  if (!date) {
    return "Hoje";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

export function formatShortDate(value) {
  const date = toDate(value);

  if (!date) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatDateRange(startDate, endDate) {
  const formattedStart = formatShortDate(startDate);

  if (!endDate) {
    return `Desde ${formattedStart}`;
  }

  return `${formattedStart} - ${formatShortDate(endDate)}`;
}

export function formatDateTime(value, fallback = "Sem horário") {
  const date = toDate(value);

  if (!date) {
    return fallback;
  }

  return `${formatShortDate(date)} às ${formatTime(date)}`;
}

export function formatShortDateTime(value, fallback = "sem data definida") {
  const date = toDate(value);

  if (!date) {
    return fallback;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatDateInput(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }

  const date = toDate(value);

  if (!date) {
    return "";
  }

  return formatDateParts(date);
}

export function formatLocalDateInput(value) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  return formatDateParts(date);
}

export function formatTimeInput(value) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function formatDateParts(date) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join("-");
}

function padDatePart(value) {
  return String(value).padStart(2, "0");
}
