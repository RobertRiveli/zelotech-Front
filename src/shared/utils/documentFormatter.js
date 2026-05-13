export function onlyNumbers(value = "") {
  return value.replace(/\D/g, "");
}

export function formatDocument(value = "", groups, separators) {
  const numbers = onlyNumbers(value);
  let cursor = 0;

  return groups
    .map((size, index) => {
      const chunk = numbers.slice(cursor, cursor + size);
      cursor += size;

      if (!chunk) {
        return "";
      }

      const nextHasValue = numbers.length > cursor;
      return nextHasValue ? `${chunk}${separators[index] ?? ""}` : chunk;
    })
    .join("");
}

export function formatCpf(value = "") {
  return formatDocument(value, [3, 3, 3, 2], [".", ".", "-"]);
}

export function maskCpf(value = "") {
  const numbers = onlyNumbers(value);
  const verificationDigits = numbers.length >= 2 ? numbers.slice(-2) : "**";

  return `***.***.***-${verificationDigits}`;
}

export function formatCnpj(value = "") {
  return formatDocument(value, [2, 3, 3, 4, 2], [".", ".", "/", "-"]);
}

export function formatPhone(value = "") {
  const numbers = onlyNumbers(value).slice(0, 11);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

export function isValidCpf(value = "") {
  const cpf = onlyNumbers(value);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  const firstDigit = calculateCpfDigit(cpf, 9);
  const secondDigit = calculateCpfDigit(cpf, 10);

  return cpf.endsWith(`${firstDigit}${secondDigit}`);
}

export function isValidCnpj(value = "") {
  const cnpj = onlyNumbers(value);

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  const firstDigit = calculateDocumentDigit(cnpj, 12, 5);
  const secondDigit = calculateDocumentDigit(cnpj, 13, 6);

  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
}

function calculateCpfDigit(cpf, size) {
  let sum = 0;

  for (let index = 0; index < size; index += 1) {
    sum += Number(cpf[index]) * (size + 1 - index);
  }

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}

function calculateDocumentDigit(documentNumber, size, initialWeight) {
  let sum = 0;
  let weight = initialWeight;

  for (let index = 0; index < size; index += 1) {
    sum += Number(documentNumber[index]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}
