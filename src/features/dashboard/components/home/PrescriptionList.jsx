import { formatDateRange } from "@/shared/utils/dateFormatter";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { EmptyState } from "@/shared/ui/EmptyState";

export function PrescriptionList({ prescriptions }) {
  if (prescriptions.length === 0) {
    return <EmptyState title="Nenhuma prescrição ativa encontrada." />;
  }

  return (
    <div
      className="dashboard-compact-list is-scrollable"
      role="region"
      aria-label="Prescrições em acompanhamento"
      tabIndex={0}
    >
      {prescriptions.map((prescription) => (
        <article className="dashboard-compact-item" key={prescription.id}>
          <div>
            <strong>{prescription.resident?.fullName ?? "Residente"}</strong>
            <span>
              {getMedicationName(prescription.medication)} · {prescription.frequency}
            </span>
          </div>
          <small>{formatDateRange(prescription.startDate, prescription.endDate)}</small>
        </article>
      ))}
    </div>
  );
}
