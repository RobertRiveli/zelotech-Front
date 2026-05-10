export class ApiError extends Error {
  constructor({
    errorType = "REQUEST_ERROR",
    message = "Não foi possível concluir a solicitação.",
    errors = {},
    status,
  } = {}) {
    super(message);
    this.name = "ApiError";
    this.errorType = errorType;
    this.errors = errors;
    this.status = status;
  }
}

export function createConfigurationError(message) {
  return new ApiError({
    errorType: "CONFIGURATION_ERROR",
    message,
  });
}

export function createRequestError(data, status) {
  return new ApiError({
    errorType: data?.errorType,
    message: data?.message,
    errors: data?.errors,
    status,
  });
}
