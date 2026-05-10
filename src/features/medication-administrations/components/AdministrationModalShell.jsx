import { useEffect } from "react";

export function AdministrationModalShell({
  children,
  footer,
  onClose,
  overline,
  title,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="administration-modal-layer">
      <button
        aria-label="Fechar modal"
        className="administration-modal-scrim"
        type="button"
        onClick={onClose}
      />

      <section
        aria-labelledby="administration-modal-title"
        aria-modal="true"
        className="administration-modal"
        role="dialog"
      >
        <header className="administration-modal-header">
          <div>
            <span className="overline">{overline}</span>
            <h2 id="administration-modal-title">{title}</h2>
          </div>
          <button
            className="dashboard-button dashboard-button-muted"
            type="button"
            onClick={onClose}
          >
            Fechar
          </button>
        </header>

        <div className="administration-modal-body">{children}</div>

        {footer ? <footer className="administration-modal-footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
