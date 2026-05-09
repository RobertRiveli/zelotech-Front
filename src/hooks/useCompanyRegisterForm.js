import { useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { registerCompany } from "../services/companyService";
import {
  formatCnpj,
  formatCpf,
  formatPhone,
  isValidCnpj,
  isValidCpf,
  onlyNumbers,
} from "../utils/documentFormatter";
import { mapApiErrors } from "../utils/formErrors";

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
  taxId: formatCnpj,
  adminCpf: formatCpf,
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

function hasEmailShape(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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

function getGlobalError(error) {
  if (error.errorType === "CONFIGURATION_ERROR") {
    return error.message;
  }

  return "Não foi possível cadastrar a empresa. Revise os dados e tente novamente.";
}

export function useCompanyRegisterForm() {
  const navigate = useNavigate();
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
      navigate("/login");
    } catch (error) {
      const apiFieldErrors = mapApiErrors(error.errors, apiFieldToFormField);
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
