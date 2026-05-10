import {
  buildResidentAdministrationSummary,
  countRecordsByResidentId,
} from "@/features/residents/utils/residentDashboardUtils";
import { ResidentDirectoryRow } from "./ResidentDirectoryRow";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingRows } from "@/shared/ui/LoadingRows";

export function ResidentsDirectory({
  administrations,
  currentTime,
  isLoading,
  onSelectResident,
  prescriptions,
  residents,
  selectedResidentId,
}) {
  if (isLoading) {
    return <LoadingRows />;
  }

  if (residents.length === 0) {
    return <EmptyState title="Nenhum residente ativo encontrado." />;
  }

  return (
    <div className="residents-directory">
      {residents.map((resident) => (
        <ResidentDirectoryRow
          administrationSummary={buildResidentAdministrationSummary(
            resident.id,
            administrations,
            currentTime,
          )}
          isSelected={resident.id === selectedResidentId}
          key={resident.id}
          onSelectResident={onSelectResident}
          prescriptionCount={countRecordsByResidentId(prescriptions, resident.id)}
          resident={resident}
          currentTime={currentTime}
        />
      ))}
    </div>
  );
}
