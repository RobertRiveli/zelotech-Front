import { matchesSearch } from "@/shared/utils/search";
import { normalizeText } from "@/shared/utils/textFormatter";
import { getMedicationName } from "@/features/medications/utils/medicationFormatters";

export function buildMedicationStats(medications) {
  return {
    active: medications.length,
  };
}

export function buildMedicationFormFilters(medications) {
  const forms = [...new Set(medications.map((medication) => medication.form))]
    .filter(Boolean)
    .sort((firstForm, secondForm) =>
      normalizeText(firstForm).localeCompare(normalizeText(secondForm), "pt-BR"),
    );

  return [
    { id: "all", label: "Todas" },
    ...forms.map((form) => ({
      id: form,
      label: formatMedicationForm(form),
    })),
  ];
}

export function filterMedications(medications, { filterId, searchTerm }) {
  const normalizedSearch = normalizeText(searchTerm);

  return medications.filter((medication) => {
    const matchesFilter = filterId === "all" || medication.form === filterId;

    if (!matchesFilter) {
      return false;
    }

    return matchesSearch(
      [
        getMedicationName(medication),
        medication.genericName,
        medication.brandName,
        medication.form,
        medication.strength,
      ],
      normalizedSearch,
    );
  });
}

export function findDuplicateMedication(medications, form, ignoredMedicationId = "") {
  const genericName = normalizeText(form.genericName);
  const medicationForm = normalizeText(form.form);
  const strength = normalizeText(form.strength);

  return medications.find((medication) => {
    if (medication.id === ignoredMedicationId) {
      return false;
    }

    return (
      normalizeText(medication.genericName) === genericName &&
      normalizeText(medication.form) === medicationForm &&
      normalizeText(medication.strength) === strength
    );
  });
}

export function formatMedicationForm(form) {
  if (!form) {
    return "Sem forma";
  }

  return form.charAt(0).toUpperCase() + form.slice(1);
}
