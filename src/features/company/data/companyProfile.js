export const companyProfileFields = [
  {
    autoComplete: "organization",
    id: "companyLegalName",
    label: "Razão social",
    maxLength: 160,
    name: "legalName",
    placeholder: "Razão social registrada",
  },
  {
    autoComplete: "organization-title",
    id: "companyTradeName",
    label: "Nome fantasia",
    maxLength: 160,
    name: "tradeName",
    placeholder: "Nome usado publicamente",
  },
  {
    autoComplete: "off",
    id: "companyTaxId",
    inputMode: "numeric",
    label: "CNPJ",
    maxLength: 18,
    name: "taxId",
    placeholder: "00.000.000/0000-00",
  },
  {
    autoComplete: "email",
    id: "companyEmail",
    label: "E-mail institucional",
    name: "email",
    placeholder: "contato@empresa.com.br",
    type: "email",
  },
  {
    autoComplete: "tel",
    id: "companyPhone",
    inputMode: "tel",
    label: "Telefone institucional",
    maxLength: 15,
    name: "phone",
    placeholder: "(85) 99999-8888",
    type: "tel",
  },
];

export const companyDetailItems = [
  {
    key: "legalName",
    label: "Razão social",
  },
  {
    key: "tradeName",
    label: "Nome fantasia",
  },
  {
    key: "taxId",
    label: "CNPJ",
  },
  {
    key: "email",
    label: "E-mail",
  },
  {
    key: "phone",
    label: "Telefone",
  },
];
