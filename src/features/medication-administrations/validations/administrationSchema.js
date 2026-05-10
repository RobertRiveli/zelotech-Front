import { parseBrazilianDateTime } from "@/features/medication-administrations/utils/administrationForms";

const MAX_NOTES_LENGTH = 1000;

const actionsWithRequiredReason = {
  cancel: "Informe a justificativa do cancelamento.",
  miss: "Informe a justificativa da perda.",
  refuse: "Informe a justificativa da recusa.",
};

export function validateAdministrationActionForm(form, actionType) {
  const errors = {};

  if (actionsWithRequiredReason[actionType] && !form.reason.trim()) {
    errors.reason = actionsWithRequiredReason[actionType];
  }

  if (
    actionType === "administer" &&
    form.administeredAt &&
    !parseBrazilianDateTime(form.administeredAt)
  ) {
    errors.administeredAt = "Use o formato dd/mm/aaaa hh:mm.";
  }

  validateNotes(form, errors);

  return errors;
}

export function validateManualAdministrationForm(form) {
  const errors = {};

  if (!form.residentId) {
    errors.residentId = "Selecione o residente.";
  }

  if (!form.prescriptionId) {
    errors.prescriptionId = "Selecione a prescrição.";
  }

  if (!form.scheduledAt) {
    errors.scheduledAt = "Informe o horário previsto.";
  } else if (!isValidDateTime(form.scheduledAt)) {
    errors.scheduledAt = "Informe um horário válido.";
  }

  validateNotes(form, errors);

  return errors;
}

function validateNotes(form, errors) {
  if ((form.notes?.trim().length ?? 0) > MAX_NOTES_LENGTH) {
    errors.notes = `Use no máximo ${MAX_NOTES_LENGTH} caracteres.`;
  }
}

function isValidDateTime(value) {
  return !Number.isNaN(new Date(value).getTime());
}
