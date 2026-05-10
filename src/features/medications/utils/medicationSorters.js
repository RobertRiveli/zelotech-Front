import { normalizeText } from "@/shared/utils/textFormatter";

export function compareByGenericName(firstMedication, secondMedication) {
  return normalizeText(firstMedication.genericName).localeCompare(
    normalizeText(secondMedication.genericName),
    "pt-BR",
  );
}
