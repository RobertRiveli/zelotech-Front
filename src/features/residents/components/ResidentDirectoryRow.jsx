import { ResidentRow } from "./ResidentRow";

export function ResidentDirectoryRow({
  administrationSummary,
  currentTime,
  isSelected,
  onSelectResident,
  prescriptionCount,
  resident,
}) {
  return (
    <ResidentRow
      currentTime={currentTime}
      isSelected={isSelected}
      resident={resident}
      showMeta={false}
      stats={[
        `${prescriptionCount} prescrições`,
        `${administrationSummary.pending} pendentes`,
        `${administrationSummary.late} atrasadas`,
      ]}
      statsAriaLabel="Resumo operacional"
      onSelectResident={onSelectResident}
    />
  );
}
