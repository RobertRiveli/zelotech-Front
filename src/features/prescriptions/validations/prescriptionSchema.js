export function validatePrescriptionForm(form) {
  const errors = {};
  const intervalHours = Number(form.intervalHours);

  if (!form.residentId) {
    errors.residentId = "Selecione um residente.";
  }

  if (!form.medicationId) {
    errors.medicationId = "Selecione um medicamento.";
  }

  if (!form.measurementUnitId) {
    errors.measurementUnitId = "Selecione uma unidade.";
  }

  if (!form.dosage.trim()) {
    errors.dosage = "Informe a dosagem.";
  }

  if (!form.route.trim()) {
    errors.route = "Informe a via.";
  }

  if (!form.frequency.trim()) {
    errors.frequency = "Informe a frequência.";
  }

  if (!Number.isInteger(intervalHours) || intervalHours <= 0) {
    errors.intervalHours = "Use um número inteiro maior que zero.";
  }

  if (!form.firstScheduledDate || !form.firstScheduledTime) {
    errors.firstScheduledAt = "Informe a primeira data e horário.";
  }

  if (!form.prescribedBy.trim()) {
    errors.prescribedBy = "Informe o prescritor.";
  }

  if (!form.startDate) {
    errors.startDate = "Informe a data inicial.";
  }

  if (form.endDate && form.startDate && form.endDate < form.startDate) {
    errors.endDate = "A data final não pode ser menor que a inicial.";
  }

  if (
    form.firstScheduledDate &&
    form.startDate &&
    form.firstScheduledDate < form.startDate
  ) {
    errors.firstScheduledAt = "O primeiro horário não pode vir antes do início.";
  }

  if (
    form.endDate &&
    form.firstScheduledDate &&
    form.firstScheduledDate > form.endDate
  ) {
    errors.firstScheduledAt = "O primeiro horário não pode vir após o fim.";
  }

  return errors;
}
