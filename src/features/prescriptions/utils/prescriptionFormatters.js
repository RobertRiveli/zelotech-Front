export function formatPrescriptionDosage(prescription) {
  const dosage = prescription.dosage;
  const abbreviation = prescription.measurementUnit?.abbreviation;
  const route = prescription.route;

  return [dosage, abbreviation, route].filter(Boolean).join(" ") || "Dose registrada";
}
