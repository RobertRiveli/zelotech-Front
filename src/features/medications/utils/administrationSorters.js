import { toDate } from "@/shared/utils/dateFormatter";

export function compareByScheduledAt(first, second) {
  return compareDates(first.scheduledAt, second.scheduledAt, "asc");
}

export function compareByScheduledAtDesc(first, second) {
  return compareDates(first.scheduledAt, second.scheduledAt, "desc");
}

function compareDates(firstDate, secondDate, direction = "asc") {
  const firstTime = toDate(firstDate)?.getTime() ?? 0;
  const secondTime = toDate(secondDate)?.getTime() ?? 0;

  return direction === "asc" ? firstTime - secondTime : secondTime - firstTime;
}
