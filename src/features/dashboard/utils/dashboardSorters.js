import { toDate } from "./dashboardFormatters";

export function compareByScheduledAt(first, second) {
  return compareDates(first.scheduledAt, second.scheduledAt, "asc");
}

export function compareByScheduledAtDesc(first, second) {
  return compareDates(first.scheduledAt, second.scheduledAt, "desc");
}

export function compareByStartDate(first, second) {
  return compareDates(first.startDate, second.startDate, "desc");
}

export function compareByAdmissionDate(first, second) {
  return compareDates(first.admissionDate, second.admissionDate, "desc");
}

function compareDates(firstDate, secondDate, direction = "asc") {
  const firstTime = toDate(firstDate)?.getTime() ?? 0;
  const secondTime = toDate(secondDate)?.getTime() ?? 0;

  return direction === "asc" ? firstTime - secondTime : secondTime - firstTime;
}
