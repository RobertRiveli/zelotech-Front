import {
  formatDateRange,
} from "@/shared/utils/dateFormatter";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";
import { formatPrescriptionDosage } from "@/features/prescriptions/utils/prescriptionFormatters";
import { compareByStartDate } from "@/features/prescriptions/utils/prescriptionSorters";
import { EmptyState } from "@/shared/ui/EmptyState";

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
