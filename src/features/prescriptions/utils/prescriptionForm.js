import {
  formatDateInput,
  formatLocalDateInput,
  formatTimeInput,
} from "@/features/dashboard/utils/dashboardFormatters";

export function createEmptyPrescriptionForm() {
  const today = formatDateInput(new Date());

  return {
    dosage: "",
    endDate: "",
    firstScheduledDate: today,
    firstScheduledTime: "08:00",
    frequency: "a cada 8 horas",
    intervalHours: "8",
    measurementUnitId: "",
    medicationId: "",
    prescribedBy: "",
    residentId: "",
    route: "oral",
    startDate: today,
  };
}

export function createPrescriptionFormFromPrescription(prescription) {
  const firstScheduledDate =
    formatLocalDateInput(prescription.firstScheduledAt) || formatDateInput(new Date());
  const firstScheduledTime = formatTimeInput(prescription.firstScheduledAt) || "08:00";

  return {
    dosage: prescription.dosage ?? "",
    endDate: formatDateInput(prescription.endDate),
    firstScheduledDate,
    firstScheduledTime,
    frequency: prescription.frequency ?? "",
    intervalHours: String(prescription.intervalHours ?? ""),
    measurementUnitId:
      prescription.measurementUnitId ?? prescription.measurementUnit?.id ?? "",
    medicationId: prescription.medicationId ?? prescription.medication?.id ?? "",
    prescribedBy: prescription.prescribedBy ?? "",
    residentId: prescription.residentId ?? prescription.resident?.id ?? "",
    route: prescription.route ?? "",
    startDate: formatDateInput(prescription.startDate),
  };
}
