import { formatShortDateTime } from "@/shared/utils/dateFormatter";
import { EmptyState } from "@/shared/ui/EmptyState";

export function ResidentFamilyMemberList({ familyMembers }) {
  if (familyMembers.length === 0) {
    return <EmptyState title="Nenhum familiar vinculado a este residente." />;
  }

  return (
    <div className="resident-family-member-list" aria-label="Familiares vinculados">
      {familyMembers.map((familyAccess) => {
        const familyMember = familyAccess.familyMember ?? {};

        return (
          <article
            className="resident-family-member-item"
            key={familyAccess.accessId ?? familyMember.id}
          >
            <span className="resident-family-member-avatar" aria-hidden="true">
              {getInitials(familyMember.fullName)}
            </span>
            <div>
              <strong>{familyMember.fullName ?? "Familiar sem nome"}</strong>
              <span>{familyMember.email ?? "E-mail não informado"}</span>
              <small>
                {formatRelationship(familyAccess.relationship)} · Vinculado em{" "}
                {formatShortDateTime(familyAccess.createdAt)}
              </small>
            </div>
            <span className="resident-family-member-phone">
              {formatPhone(familyMember.phone)}
            </span>
          </article>
        );
      })}
    </div>
  );
}

function getInitials(value) {
  const words = String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "--";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatRelationship(value) {
  if (!value) {
    return "Relacionamento não informado";
  }

  return String(value).replace(/^./, (letter) => letter.toUpperCase());
}

function formatPhone(value) {
  const numbers = String(value ?? "").replace(/\D/g, "");

  if (!numbers) {
    return "Sem telefone";
  }

  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }

  return value;
}
