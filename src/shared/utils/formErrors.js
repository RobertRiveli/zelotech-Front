export function clearFieldError(errors, fieldName, aliasesByField = {}) {
  const nextErrors = { ...errors };
  const fieldsToClear = [fieldName, ...(aliasesByField[fieldName] ?? [])];

  fieldsToClear.forEach((field) => {
    delete nextErrors[field];
  });

  return nextErrors;
}

export function getRequestErrorMessage(
  error,
  fallback = "Não foi possível concluir a solicitação.",
) {
  const fieldMessages = Object.values(error?.errors ?? {});

  return fieldMessages.find(Boolean) ?? error?.message ?? fallback;
}

export function mapApiErrors(errors, fieldMap = {}) {
  return Object.entries(errors ?? {}).reduce((mappedErrors, [field, message]) => {
    const formField = fieldMap[field] ?? field;
    mappedErrors[formField] = message;
    return mappedErrors;
  }, {});
}
