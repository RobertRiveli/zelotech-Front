export function getMedicationName(medication) {
  if (!medication) {
    return "Medicamento";
  }

  return medication.brandName
    ? `${medication.genericName} (${medication.brandName})`
    : medication.genericName;
}

export function getDosage(administration) {
  const dosage = administration.prescription?.dosage;
  const abbreviation = administration.measurementUnit?.abbreviation;

  return [dosage, abbreviation].filter(Boolean).join(" ") || "Dose registrada";
}
