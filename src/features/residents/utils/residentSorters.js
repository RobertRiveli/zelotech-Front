import { toDate } from "@/shared/utils/dateFormatter";

export function compareByFullName(first, second) {
  return (first.fullName ?? "").localeCompare(second.fullName ?? "", "pt-BR");
}

export function compareByAdmissionDate(first, second) {
  return compareDates(first.admissionDate, second.admissionDate, "desc");
}

function compareDates(firstDate, secondDate, direction = "asc") {
  const firstTime = toDate(firstDate)?.getTime() ?? 0;
  const secondTime = toDate(secondDate)?.getTime() ?? 0;

  return direction === "asc" ? firstTime - secondTime : secondTime - firstTime;
}
