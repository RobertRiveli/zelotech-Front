import { formatShortDateTime } from "@/shared/utils/dateFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";

export function ResidentAccessCodeList({ accessCodes, onCopy }) {
  if (accessCodes.length === 0) {
    return <EmptyState title="Nenhum código ativo para este residente." />;
  }

  return (
    <div className="resident-access-code-list" aria-label="Códigos ativos">
      {accessCodes.map((accessCode) => (
        <article className="resident-access-code-item" key={getAccessCodeKey(accessCode)}>
          <div>
            <strong>{accessCode.code}</strong>
            <span>Expira em {formatShortDateTime(accessCode.expiresAt)}</span>
            <small>
              {getRemainingUsesLabel(accessCode)} de {accessCode.maxUses} uso
              {Number(accessCode.maxUses) === 1 ? "" : "s"}
            </small>
          </div>
          <button
            className="dashboard-button dashboard-button-muted"
            type="button"
            onClick={() => onCopy(accessCode.code)}
          >
            Copiar
          </button>
        </article>
      ))}
    </div>
  );
}

function getAccessCodeKey(accessCode) {
  return accessCode.id ?? `${accessCode.residentId}-${accessCode.code}`;
}

function getRemainingUsesLabel(accessCode) {
  const remainingUses = Number(accessCode.remainingUses);

  if (Number.isInteger(remainingUses) && remainingUses >= 0) {
    return `${remainingUses} restante${remainingUses === 1 ? "" : "s"}`;
  }

  const maxUses = Number(accessCode.maxUses);
  const usesCount = Number(accessCode.usesCount);

  if (Number.isInteger(maxUses) && Number.isInteger(usesCount)) {
    const fallbackRemainingUses = Math.max(maxUses - usesCount, 0);

    return `${fallbackRemainingUses} restante${
      fallbackRemainingUses === 1 ? "" : "s"
    }`;
  }

  return "Usos disponíveis";
}
