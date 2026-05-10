export function createEmptyMedicationForm() {
  return {
    brandName: "",
    form: "",
    genericName: "",
    strength: "",
  };
}

export function createMedicationFormFromMedication(medication) {
  return {
    brandName: medication?.brandName ?? "",
    form: medication?.form ?? "",
    genericName: medication?.genericName ?? "",
    strength: medication?.strength ?? "",
  };
}
