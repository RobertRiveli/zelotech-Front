import {
  formatDateRange,
  formatPrescriptionDosage,
  getMedicationName,
} from "@/features/dashboard/utils/dashboardFormatters";
import { compareByStartDate } from "@/features/dashboard/utils/dashboardSorters";
import { EmptyState } from "@/features/dashboard/components/shared/EmptyState";

export function ResidentPrescriptionDetails({ prescriptions }) {
  if (prescriptions.length === 0) {
    return <EmptyState title="Nenhuma prescrição ativa vinculada." />;
  }

  return (
    <div className="resident-detail-list">
      {[...prescriptions].sort(compareByStartDate).slice(0, 4).map((prescription) => (
        <article className="resident-detail-item" key={prescription.id}>
          <div>
            <strong>{getMedicationName(prescription.medication)}</strong>
            <span>
              {formatPrescriptionDosage(prescription)} · {prescription.frequency}
            </span>
          </div>
          <small>{formatDateRange(prescription.startDate, prescription.endDate)}</small>
        </article>
      ))}
    </div>
  );
}
