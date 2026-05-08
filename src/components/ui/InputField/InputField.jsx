function InputField({
  autoComplete,
  className = "",
  error,
  id,
  inputMode,
  label,
  maxLength,
  name,
  onBlur,
  onChange,
  placeholder,
  type = "text",
  value,
  ...props
}) {
  const errorId = `${id}-error`;

  return (
    <div className={`input-field ${className}`.trim()}>
      <label className="input-label" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : "false"}
        autoComplete={autoComplete}
        className={`input-control ${error ? "input-control-error" : ""}`.trim()}
        id={id}
        inputMode={inputMode}
        maxLength={maxLength}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
        {...props}
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
