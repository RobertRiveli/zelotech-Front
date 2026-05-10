export function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <small className="dashboard-field-error">{message}</small>;
}
