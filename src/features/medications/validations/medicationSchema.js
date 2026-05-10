export function validateMedicationForm(form) {
  const errors = {};
  const genericName = form.genericName.trim();
  const brandName = form.brandName.trim();
  const medicationForm = form.form.trim();
  const strength = form.strength.trim();

  if (genericName.length < 2) {
    errors.genericName = "Informe um nome com pelo menos 2 caracteres.";
  }

  if (genericName.length > 120) {
    errors.genericName = "Use no máximo 120 caracteres.";
  }

  if (brandName.length > 120) {
    errors.brandName = "Use no máximo 120 caracteres.";
  }

  if (medicationForm.length < 2) {
    errors.form = "Informe a forma do medicamento.";
  }

  if (strength.length > 80) {
    errors.strength = "Use no máximo 80 caracteres.";
  }

  return errors;
}
