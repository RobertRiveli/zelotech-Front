function InputField({
  error,
  id,
  label,
  maxLength,
  name,
  onBlur,
  onChange,
  placeholder,
  type = "text",
  value,
  autoComplete,
}) {
  const errorId = `${id}-error`;

  return (
    <div className="input-field">
      <label className="input-label" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : "false"}
        autoComplete={autoComplete}
        className={`input-control ${error ? "input-control-error" : ""}`}
        id={id}
        maxLength={maxLength}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error ? (
        <span className="input-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export default InputField;
