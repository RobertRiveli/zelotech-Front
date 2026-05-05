import styles from "./Button.module.css";

function Button({
  children,
  className = "",
  disabled = false,
  fullWidth = false,
  isLoading = false,
  loadingLabel = "Carregando...",
  type = "button",
  variant = "navy",
  size = "lg",
  ...props
}) {
  const classes = [
    styles.button,
    "btn",
    `btn-${variant}`,
    size ? `btn-${size}` : "",
    fullWidth ? styles.fullWidth : "",
    isLoading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? loadingLabel : children}
    </button>
  );
}

export default Button;
