import { useReducer } from "react";
import { registerCompany } from "../services/companyService";

const initialForm = {
  legalName: "",
  tradeName: "",
  taxId: "",
  email: "",
  phone: "",
  adminFullName: "",
  adminEmail: "",
  adminPhone: "",
  adminCpf: "",
  adminPassword: "",
};

const initialState = {
  form: initialForm,
  fieldErrors: {},
  globalError: "",
  isSubmitting: false,
  submittedCompany: null,
};

const apiFieldToFormField = {
  legalName: "legalName",
  tradeName: "tradeName",
  taxId: "taxId",
  email: "email",
  phone: "phone",
  fullName: "adminFullName",
  cpf: "adminCpf",
  password: "adminPassword",
  adminEmail: "adminEmail",
  adminPhone: "adminPhone",
  adminCpf: "adminCpf",
  adminPassword: "adminPassword",
};

const masks = {
  taxId: (value) => formatDocument(value, [2, 3, 3, 4, 2], [".", ".", "/", "-"]),
  adminCpf: (value) => formatDocument(value, [3, 3, 3, 2], [".", ".", "-"]),
  phone: formatPhone,
  adminPhone: formatPhone,
};

function reducer(state, action) {
  switch (action.type) {
    case "change": {
      const { name, value } = action.payload;
      const fieldErrors = { ...state.fieldErrors };
      delete fieldErrors[name];

      return {
        ...state,
        form: {
          ...state.form,
          [name]: masks[name] ? masks[name](value) : value,
        },
        fieldErrors,
        globalError: "",
      };
    }
    case "fieldErrors":
      return {
        ...state,
        fieldErrors: action.payload,
      };
    case "submitStart":
      return {
        ...state,
        isSubmitting: true,
        fieldErrors: {},
        globalError: "",
        submittedCompany: null,
      };
    case "submitSuccess":
      return {
        ...state,
        isSubmitting: false,
        submittedCompany: action.payload,
      };
    case "submitError":
      return {
        ...state,
        isSubmitting: false,
        fieldErrors: action.payload.fieldErrors ?? {},
        globalError: action.payload.globalError ?? "",
      };
    default:
      return state;
  }
}

function onlyNumbers(value) {
  return value.replace(/\D/g, "");
}

function formatDocument(value, groups, separators) {
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

function formatPhone(value) {
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

function hasEmailShape(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidCpf(value) {
  const cpf = onlyNumbers(value);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  const firstDigit = calculateDocumentDigit(cpf, 9, 10);
  const secondDigit = calculateDocumentDigit(cpf, 10, 11);

  return cpf.endsWith(`${firstDigit}${secondDigit}`);
}

function isValidCnpj(value) {
  const cnpj = onlyNumbers(value);

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  const firstDigit = calculateDocumentDigit(cnpj, 12, 5);
  const secondDigit = calculateDocumentDigit(cnpj, 13, 6);

  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
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

function validateForm(form) {
  const errors = {};

  if (!form.legalName.trim()) {
    errors.legalName = "Informe a razão social.";
  } else if (form.legalName.trim().length > 160) {
    errors.legalName = "A razão social deve ter no máximo 160 caracteres.";
  }

  if (form.tradeName.trim().length < 2) {
    errors.tradeName = "Informe o nome fantasia com pelo menos 2 caracteres.";
  }

  if (onlyNumbers(form.taxId).length !== 14) {
    errors.taxId = "Informe um CNPJ com 14 dígitos.";
  } else if (!isValidCnpj(form.taxId)) {
    errors.taxId = "Informe um CNPJ válido.";
  }

  if (!hasEmailShape(form.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (onlyNumbers(form.phone).length < 10) {
    errors.phone = "Informe um telefone brasileiro válido.";
  }

  if (form.adminFullName.trim().length < 3) {
    errors.adminFullName = "Informe o nome completo do administrador.";
  } else if (form.adminFullName.trim().length > 160) {
    errors.adminFullName = "O nome deve ter no máximo 160 caracteres.";
  }

  if (!hasEmailShape(form.adminEmail)) {
    errors.adminEmail = "Informe um e-mail válido para o administrador.";
  }

  if (onlyNumbers(form.adminPhone).length < 10) {
    errors.adminPhone = "Informe um telefone brasileiro válido.";
  }

  if (onlyNumbers(form.adminCpf).length !== 11) {
    errors.adminCpf = "Informe um CPF com 11 dígitos.";
  } else if (!isValidCpf(form.adminCpf)) {
    errors.adminCpf = "Informe um CPF válido.";
  }

  if (form.adminPassword.length < 8) {
    errors.adminPassword = "A senha deve ter pelo menos 8 caracteres.";
  } else if (form.adminPassword.length > 128) {
    errors.adminPassword = "A senha deve ter no máximo 128 caracteres.";
  }

  return errors;
}

function mapApiErrors(errors) {
  return Object.entries(errors ?? {}).reduce((mappedErrors, [field, message]) => {
    const formField = apiFieldToFormField[field] ?? field;
    mappedErrors[formField] = message;
    return mappedErrors;
  }, {});
}

function getGlobalError(error) {
  if (error.errorType === "CONFIGURATION_ERROR") {
    return error.message;
  }

  return "Não foi possível cadastrar a empresa. Revise os dados e tente novamente.";
}

export function useCompanyRegisterForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  function handleChange(event) {
    const { name, value } = event.target;
    dispatch({ type: "change", payload: { name, value } });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm(state.form);

    if (Object.keys(validationErrors).length > 0) {
      dispatch({ type: "fieldErrors", payload: validationErrors });
      return;
    }

    dispatch({ type: "submitStart" });

    try {
      const company = await registerCompany(state.form);
      dispatch({ type: "submitSuccess", payload: company });
      window.location.assign("/login");
    } catch (error) {
      const apiFieldErrors = mapApiErrors(error.errors);
      const hasFieldErrors = Object.keys(apiFieldErrors).length > 0;

      dispatch({
        type: "submitError",
        payload: {
          fieldErrors: apiFieldErrors,
          globalError: hasFieldErrors ? error.message : getGlobalError(error),
        },
      });
    }
  }

  return {
    ...state,
    handleChange,
    handleSubmit,
  };
}
