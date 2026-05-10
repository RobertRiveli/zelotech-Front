import { formatDateRange, getMedicationName } from "@/features/dashboard/utils/dashboardFormatters";
import { EmptyState } from "@/features/dashboard/components/shared/EmptyState";

export function PrescriptionList({ prescriptions }) {
  if (prescriptions.length === 0) {
    return <EmptyState title="Nenhuma prescrição ativa encontrada." />;
  }

  return (
    <div className="dashboard-compact-list">
      {prescriptions.slice(0, 5).map((prescription) => (
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
