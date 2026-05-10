import { toDate } from "@/shared/utils/dateFormatter";
import { isLateAdministration } from "./administrationStatus";

export function compareByScheduledAt(first, second) {
  return compareDates(first.scheduledAt, second.scheduledAt, "asc");
}

export function compareByScheduledAtDesc(first, second) {
  return compareDates(first.scheduledAt, second.scheduledAt, "desc");
}

export function compareByAdministrationPriority(currentTime) {
  return (first, second) => {
    const firstRank = getAdministrationPriorityRank(first, currentTime);
    const secondRank = getAdministrationPriorityRank(second, currentTime);

    if (firstRank !== secondRank) {
      return firstRank - secondRank;
    }

    const direction = firstRank <= 1 ? "asc" : "desc";

    return compareDates(first.scheduledAt, second.scheduledAt, direction);
  };
}

function compareDates(firstDate, secondDate, direction = "asc") {
  const firstTime = toDate(firstDate)?.getTime() ?? 0;
  const secondTime = toDate(secondDate)?.getTime() ?? 0;

  return direction === "asc" ? firstTime - secondTime : secondTime - firstTime;
}

function getAdministrationPriorityRank(administration, currentTime) {
  const status = administration.status ?? "PENDING";

  if (isLateAdministration(administration, currentTime)) {
    return 0;
  }

  if (status === "PENDING") {
    return 1;
  }

  if (status === "ADMINISTERED") {
    return 2;
  }

  if (status === "REFUSED" || status === "MISSED") {
    return 3;
  }

  return 4;
}
