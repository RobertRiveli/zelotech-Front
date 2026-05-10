import { normalizeText } from "./textFormatter";

export function matchesSearch(values, normalizedSearch) {
  if (!normalizedSearch) {
    return true;
  }

  return values.some((value) => normalizeText(value).includes(normalizedSearch));
}
