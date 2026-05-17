import { matchesSearch } from "@/shared/utils/search";
import { normalizeText } from "@/shared/utils/textFormatter";
import {
  medicationFormLabels,
  medicationFormOptions,
} from "@/features/medications/constants/medicationForms";

export function buildMedicationStats(medications) {
  return {
    active: medications.length,
  };
}

export function buildMedicationFormFilters(medications) {
  const optionKeys = new Set(medicationFormOptions.map(normalizeText));
  const customForms = [...new Set(medications.map((medication) => medication.form))]
    .filter((form) => form && !optionKeys.has(normalizeText(form)))
    .sort((firstForm, secondForm) =>
      normalizeText(firstForm).localeCompare(normalizeText(secondForm), "pt-BR"),
    );
  const forms = [...medicationFormOptions, ...customForms];

  return [
    { count: medications.length, id: "all", label: "Todas" },
    ...forms.map((form) => ({
      count: medications.filter(
        (medication) => normalizeText(medication.form) === normalizeText(form),
      ).length,
      id: form,
      label: formatMedicationForm(form),
    })),
  ];
}

export function filterMedications(medications, { filterId, searchTerm }) {
  const normalizedSearch = normalizeText(searchTerm);
  const normalizedFilter = normalizeText(filterId);

  return medications.filter((medication) => {
    const matchesFilter =
      filterId === "all" || normalizeText(medication.form) === normalizedFilter;

    if (!matchesFilter) {
      return false;
    }

    return matchesSearch(
      [
        medication.genericName,
        medication.brandName,
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

  const normalizedForm = normalizeText(form);

  return (
    medicationFormLabels[normalizedForm] ??
    form.charAt(0).toUpperCase() + form.slice(1)
  );
}
