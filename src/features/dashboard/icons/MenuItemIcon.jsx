const iconsByMenuItem = {
  "Administração de medicamentos": AdministrationIcon,
  Configurações: SettingsIcon,
  Empresa: BuildingIcon,
  Equipe: TeamIcon,
  "Família / Acessos": FamilyAccessIcon,
  Início: HomeIcon,
  Medicamentos: MedicationIcon,
  Prescrições: PrescriptionIcon,
  Relatórios: ReportsIcon,
  Residentes: ResidentsIcon,
};

export function MenuItemIcon({ item }) {
  const Icon = iconsByMenuItem[item] ?? DefaultIcon;

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <Icon />
    </svg>
  );
}

function HomeIcon() {
  return (
    <>
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6.5 10.5V19h11v-8.5" />
      <path d="M10 19v-5h4v5" />
    </>
  );
}

function ResidentsIcon() {
  return (
    <>
      <path d="M7.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M3.5 19a4 4 0 0 1 8 0" />
      <path d="M16.5 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M14 15.5a3.5 3.5 0 0 1 6.5 1.8" />
    </>
  );
}

function PrescriptionIcon() {
  return (
    <>
      <path d="M8 4h8" />
      <path d="M9 4v3h6V4" />
      <rect x="5" y="6" width="14" height="15" rx="2" />
      <path d="M8.5 11h7" />
      <path d="M8.5 15h4.5" />
    </>
  );
}

function AdministrationIcon() {
  return (
    <>
      <path d="M9 4h6" />
      <path d="M10 4v4l-4.5 7.5A3.2 3.2 0 0 0 8.2 20h7.6a3.2 3.2 0 0 0 2.7-4.5L14 8V4" />
      <path d="M8 14h8" />
      <path d="M12 12v4" />
    </>
  );
}

function MedicationIcon() {
  return (
    <>
      <path d="m8.2 15.8 7.6-7.6a3.1 3.1 0 0 1 4.4 4.4l-7.6 7.6a3.1 3.1 0 0 1-4.4-4.4Z" />
      <path d="m12 12 4 4" />
      <path d="M4 8h6" />
      <path d="M7 5v6" />
    </>
  );
}

function TeamIcon() {
  return (
    <>
      <path d="M12 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
      <path d="M6.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M4.8 10.5a2.2 2.2 0 1 0 0-4.4" />
      <path d="M19.2 10.5a2.2 2.2 0 1 1 0-4.4" />
    </>
  );
}

function FamilyAccessIcon() {
  return (
    <>
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M3.5 19a4.5 4.5 0 0 1 9 0" />
      <circle cx="16.5" cy="14.5" r="2.5" />
      <path d="M18.3 16.3 21 19" />
      <path d="M21 19l-1.4 1.4" />
    </>
  );
}

function BuildingIcon() {
  return (
    <>
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      <path d="M3.5 21h17" />
      <path d="M8.5 7h2" />
      <path d="M13.5 7h2" />
      <path d="M8.5 11h2" />
      <path d="M13.5 11h2" />
      <path d="M10 21v-5h4v5" />
    </>
  );
}

function ReportsIcon() {
  return (
    <>
      <path d="M5 20V5" />
      <path d="M5 20h15" />
      <path d="M9 16v-5" />
      <path d="M13 16V8" />
      <path d="M17 16v-3" />
    </>
  );
}

function SettingsIcon() {
  return (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2" />
      <path d="M12 18.5v2" />
      <path d="m5.9 5.9 1.4 1.4" />
      <path d="m16.7 16.7 1.4 1.4" />
      <path d="M3.5 12h2" />
      <path d="M18.5 12h2" />
      <path d="m5.9 18.1 1.4-1.4" />
      <path d="m16.7 7.3 1.4-1.4" />
    </>
  );
}

function DefaultIcon() {
  return (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8" />
      <path d="M8 13h6" />
    </>
  );
}
