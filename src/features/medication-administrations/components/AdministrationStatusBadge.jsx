import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  administrationStatusLabels,
  administrationStatusTone,
} from "@/features/medication-administrations/constants/administrationStatus";

export function AdministrationStatusBadge({ status }) {
  if (status === "LATE") {
    return <StatusBadge tone="danger">Atrasada</StatusBadge>;
  }

  return (
    <StatusBadge tone={administrationStatusTone[status] ?? "muted"}>
      {administrationStatusLabels[status] ?? status}
    </StatusBadge>
  );
}
