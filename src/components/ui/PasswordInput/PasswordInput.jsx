import { useState } from "react";
import styles from "./PasswordInput.module.css";

function PasswordInput({
  autoComplete,
  className = "",
  error,
  id,
  label,
  maxLength,
  name,
  onChange,
  placeholder,
  value,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div className={`${styles.field} input-field ${className}`.trim()}>
      <label className="input-label" htmlFor={id}>
        {label}
      </label>
      <div className={styles.controlWrap}>
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? "true" : "false"}
          autoComplete={autoComplete}
          className={`${styles.control} input-control ${
            error ? "input-control-error" : ""
          }`.trim()}
          id={id}
          maxLength={maxLength}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={isVisible}
          className={styles.toggle}
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {error ? (
        <span
          className={`${styles.errorText} input-error`}
          id={errorId}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}

export default PasswordInput;
