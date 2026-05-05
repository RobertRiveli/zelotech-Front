export function onlyNumbers(value = "") {
  return value.replace(/\D/g, "");
}

export function formatCpf(value = "") {
  const cpf = onlyNumbers(value).slice(0, 11);

  if (cpf.length <= 3) {
    return cpf;
  }

  if (cpf.length <= 6) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  }

  if (cpf.length <= 9) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  }

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
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

function calculateCpfDigit(cpf, size) {
  let sum = 0;

  for (let index = 0; index < size; index += 1) {
    sum += Number(cpf[index]) * (size + 1 - index);
  }

  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}
