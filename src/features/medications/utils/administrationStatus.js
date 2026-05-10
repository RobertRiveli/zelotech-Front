import { toDate } from "@/shared/utils/dateFormatter";

export function countByStatus(administrations) {
  return administrations.reduce((accumulator, administration) => {
    const status = administration.status ?? "PENDING";
    accumulator[status] = (accumulator[status] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function isLateAdministration(administration, currentTime) {
  const scheduledAt = toDate(administration.scheduledAt);

  return (
    administration.status === "PENDING" &&
    scheduledAt &&
    currentTime > 0 &&
    scheduledAt.getTime() < currentTime
  );
}
