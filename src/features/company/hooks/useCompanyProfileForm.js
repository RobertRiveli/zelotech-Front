import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getCompany,
  updateCompany,
} from "@/features/company/api/companyService";
import {
  buildCompanyUpdatePayload,
  createCompanyFormFromCompany,
  formatCompanyFieldValue,
} from "@/features/company/utils/companyForm";
import { validateCompanyProfileForm } from "@/features/company/validations/companySchema";
import {
  clearFieldError,
  getRequestErrorMessage,
  mapApiErrors,
} from "@/shared/utils/formErrors";

const companyApiFieldToFormField = {
  legalName: "legalName",
  tradeName: "tradeName",
  taxId: "taxId",
  email: "email",
  phone: "phone",
};

function splitApiErrors(error) {
  const mappedErrors = mapApiErrors(error?.errors, companyApiFieldToFormField);
  const { company, token, ...fieldErrors } = mappedErrors;

  return {
    fieldErrors,
    formError: company || token || "",
  };
}

export function useCompanyProfileForm({ initialCompany, onCompanyUpdated } = {}) {
  const initialCompanyRef = useRef(initialCompany ?? null);
  const [company, setCompany] = useState(initialCompany ?? null);
  const [form, setForm] = useState(() =>
    createCompanyFormFromCompany(initialCompany),
  );
  const [initialForm, setInitialForm] = useState(() =>
    createCompanyFormFromCompany(initialCompany),
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [feedback, setFeedback] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(!initialCompany);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyCompany = useCallback((nextCompany) => {
    const nextForm = createCompanyFormFromCompany(nextCompany);

    setCompany(nextCompany);
    setForm(nextForm);
    setInitialForm(nextForm);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCompany() {
      if (initialCompanyRef.current) {
        applyCompany(initialCompanyRef.current);
      }

      setIsLoading(true);
      setGlobalError("");

      try {
        const nextCompany = await getCompany();

        if (isMounted) {
          applyCompany(nextCompany);
        }
      } catch (error) {
        if (isMounted) {
          setGlobalError(
            getRequestErrorMessage(
              error,
              "Não foi possível carregar os dados da empresa.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCompany();

    return () => {
      isMounted = false;
    };
  }, [applyCompany]);

  const hasChanges = useMemo(
    () => Object.keys(buildCompanyUpdatePayload(form, initialForm)).length > 0,
    [form, initialForm],
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: formatCompanyFieldValue(name, value),
    }));
    setFieldErrors((currentErrors) => clearFieldError(currentErrors, name));
    setFeedback("");
    setGlobalError("");
  }

  function handleReset() {
    setForm(initialForm);
    setFieldErrors({});
    setFeedback("");
    setGlobalError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = validateCompanyProfileForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setGlobalError("Revise os campos destacados antes de salvar.");
      setFeedback("");
      return;
    }

    const payload = buildCompanyUpdatePayload(form, initialForm);

    if (Object.keys(payload).length === 0) {
      setFeedback("Nenhuma alteração para salvar.");
      setGlobalError("");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setFeedback("");
    setGlobalError("");

    try {
      const updatedCompany = await updateCompany(payload);

      applyCompany(updatedCompany);
      onCompanyUpdated?.(updatedCompany);
      setFeedback("Empresa atualizada com sucesso.");
    } catch (error) {
      const apiErrors = splitApiErrors(error);
      const hasFieldErrors = Object.keys(apiErrors.fieldErrors).length > 0;

      setFieldErrors(apiErrors.fieldErrors);
      setGlobalError(
        apiErrors.formError ||
          (hasFieldErrors
            ? "Revise os campos destacados antes de salvar."
            : getRequestErrorMessage(
                error,
                "Não foi possível atualizar a empresa.",
              )),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    company,
    feedback,
    fieldErrors,
    form,
    globalError,
    handleChange,
    handleReset,
    handleSubmit,
    hasChanges,
    isLoading,
    isSubmitting,
  };
}
