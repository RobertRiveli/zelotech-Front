export const companyRegisterNavActions = [
  {
    href: "/",
    label: "Voltar ao site",
    className: "btn btn-outline-navy btn-sm",
  },
  {
    href: "/login",
    label: "Fazer login",
    className: "btn btn-navy btn-sm",
  },
];

export const companyRegisterHero = {
  eyebrow: "Cadastro institucional",
  title: "Crie a conta da sua empresa",
  subtitle:
    "Cadastre a empresa e o primeiro administrador responsável por configurar a operação na ZeloTech.",
};

export const companyRegisterPanel = {
  ariaLabel: "Resumo institucional",
  title: "Primeiro acesso",
  items: [
    "Conta institucional vinculada ao responsável inicial.",
    "Acesso administrativo para configurar equipe e operação.",
    "Base pronta para organizar residentes, rotinas e cuidado.",
  ],
};

export const companyRegisterSections = [
  {
    eyebrow: "empresa",
    title: "Dados da empresa",
    description:
      "Use os dados oficiais da instituição responsável pela contratação.",
    fields: [
      {
        id: "legalName",
        label: "Razão social",
        maxLength: 160,
        name: "legalName",
        placeholder: "Razão social registrada",
        autoComplete: "organization",
      },
      {
        id: "tradeName",
        label: "Nome fantasia",
        maxLength: 160,
        name: "tradeName",
        placeholder: "Nome usado publicamente",
        autoComplete: "organization-title",
      },
      {
        id: "taxId",
        label: "CNPJ",
        maxLength: 18,
        name: "taxId",
        placeholder: "00.000.000/0000-00",
        autoComplete: "off",
      },
      {
        id: "email",
        label: "E-mail institucional",
        name: "email",
        placeholder: "contato@empresa.com.br",
        type: "email",
        autoComplete: "email",
      },
      {
        id: "phone",
        label: "Telefone institucional",
        maxLength: 15,
        name: "phone",
        placeholder: "(85) 99999-8888",
        type: "tel",
        autoComplete: "tel",
      },
    ],
  },
  {
    eyebrow: "administrador",
    title: "Administrador inicial",
    description:
      "Este usuário terá acesso administrativo para concluir a configuração.",
    fields: [
      {
        id: "adminFullName",
        label: "Nome completo",
        maxLength: 160,
        name: "adminFullName",
        placeholder: "Nome e sobrenome",
        autoComplete: "name",
      },
      {
        id: "adminEmail",
        label: "E-mail do administrador",
        name: "adminEmail",
        placeholder: "maria@empresa.com.br",
        type: "email",
        autoComplete: "email",
      },
      {
        id: "adminPhone",
        label: "Telefone do administrador",
        maxLength: 15,
        name: "adminPhone",
        placeholder: "(85) 98888-7777",
        type: "tel",
        autoComplete: "tel",
      },
      {
        id: "adminCpf",
        label: "CPF",
        maxLength: 14,
        name: "adminCpf",
        placeholder: "000.000.000-00",
        autoComplete: "off",
      },
      {
        id: "adminPassword",
        label: "Senha de acesso",
        maxLength: 128,
        name: "adminPassword",
        placeholder: "Mínimo de 8 caracteres",
        type: "password",
        autoComplete: "new-password",
      },
    ],
  },
];

export const companyRegisterFormAction = {
  legalText:
    "Ao cadastrar, você confirma que tem autorização para representar a empresa informada.",
  submitLabel: "Cadastrar empresa",
  submittingLabel: "Cadastrando...",
};
