export const navLinks = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#para-quem", label: "Para quem" },
  { href: "#faq", label: "Dúvidas" },
];

export const partners = [];

export const howSteps = [
  {
    title: "Crie sua conta",
    description:
      "Escolha se você representa uma instituição de cuidado ou uma família. O cadastro leva menos de 5 minutos e é totalmente gratuito.",
  },
  {
    title: "Cadastre os idosos e equipe",
    description:
      "Adicione o perfil dos residentes ou do seu familiar, histórico de saúde e acompanhe de perto.",
  },
  {
    title: "Informações compartilhadas",
    description:
      "Integre o app mobile dos familiares para acompanhar os cuidados da instituição.",
  },
  {
    title: "Acompanhe com tranquilidade",
    description:
      "Receba alertas, relatórios diários e mantenha comunicação direta com a equipe — de qualquer lugar, a qualquer hora.",
  },
];

export const familyAppPreview = {
  greetingName: "Luiza",
  summary: {
    title: "3 residentes vinculados",
    subtitle: "Toque para ver detalhes",
  },
  residents: [
    {
      name: "Helena Duarte",
      kinship: "Mãe",
      age: "83 anos",
      bloodType: "A+",
      status: "Ativo",
    },
    {
      name: "Joaquim Ferreira",
      kinship: "Responsável",
      age: "86 anos",
      bloodType: "O+",
      status: "Ativo",
    },
    {
      name: "Odete Rocha",
      kinship: "Avó",
      age: "78 anos",
      bloodType: "B-",
      status: "Ativo",
    },
  ],
};

export const careDashboardPreview = {
  title: "ZeloTech · Dashboard",
  metrics: [
    {
      label: "Pressão arterial",
      value: "120/80",
      status: "Normal",
      fillClassName: "pressure-fill",
    },
    {
      label: "Frequência cardíaca",
      value: "72 bpm",
      status: "Regular",
      fillClassName: "heart-fill",
    },
  ],
  medication: {
    label: "Medicação 18h",
    value: "✓ Confirmada",
  },
};

export const residentProfilePreview = {
  initials: "JF",
  name: "Joaquim Ferreira",
  relationship: "Responsável",
  status: "Ativo",
  stats: [
    {
      label: "Idade",
      value: "86",
      helper: "anos",
    },
    {
      label: "Tipo sanguíneo",
      value: "O+",
      helper: "sangue",
    },
    {
      label: "Gênero",
      value: "-",
      helper: "não informado",
    },
    {
      label: "Admissão",
      value: "30/11",
      helper: "2024",
    },
  ],
  conditions: [
    {
      name: "Cardiopatia",
      tag: "Cardiovascular",
      note: "Evitar esforço prolongado sem supervisão.",
    },
    {
      name: "Diabetes",
      tag: "Doença crônica",
      note: "Glicemia capilar antes do jantar.",
    },
    {
      name: "Hipertensão",
      tag: "Cardiovascular",
      note: "Registrar PA quando houver tontura.",
    },
  ],
  medications: ["Cloridrato de Metformina", "Sinvastatina"],
};

export const numbers = [];

export const benefits = [
  {
    icon: "📡",
    title: "Monitoramento em Tempo Real",
    description:
      "Dados de saúde, cuidados e atividade dos idosos atualizados continuamente. Alertas inteligentes para sinais de risco.",
    theme: "navy",
  },
  {
    icon: "💊",
    title: "Gestão de Medicações",
    description:
      "Controle completo de prescrições, alertas de horários e confirmação de administração com registro digital auditável.",
    theme: "teal",
  },

  {
    icon: "🏥",
    title: "Gestão Institucional",
    description:
      "Painel completo para gestores: escalas de cuidadores, ocupação de leitos, compliance e indicadores de qualidade.",
    theme: "navy",
  },
];

export const audiences = [
  {
    type: "institution",
    tag: "🏥 Para Instituições",
    title: "Gestão completa para casas de repouso e clínicas",
    description:
      "Otimize os processos da sua equipe, acompanhe todos os residentes em um único painel e mantenha famílias informadas automaticamente.",
    features: [
      "Dashboard com todos os residentes",
      "Escala e gestão de cuidadores",
      "Prontuário eletrônico integrado",
      "Relatórios para famílias automatizados",
      "Controle de medicações",
      "Indicadores de qualidade e compliance",
    ],
    button: "Cadastrar minha instituição",
  },
  {
    type: "family",
    tag: "👨‍👩‍👧 Para Famílias",
    title: "Paz de espírito para quem ama",
    description:
      "Acompanhe seu familiar de perto, mesmo à distância. Receba alertas, veja relatórios de saúde e mantenha contato com os cuidadores em tempo real.",
    features: [
      "Alertas de saúde e bem-estar",
      "Acompanhamento de medicações",

      "Histórico de atividades",
      "Compartilhe com a família toda",
      "App intuitivo, fácil de usar",
    ],
    button: "Cadastrar minha família",
  },
];

export const faqItems = [
  {
    question: "A ZeloTech é para clínicas, casas de repouso ou famílias?",
    answer:
      "Hoje a ZeloTech ajuda principalmente instituições de cuidado, como casas de repouso e clínicas. A instituição organiza os residentes, a equipe e a rotina de medicamentos em um só lugar, e também pode liberar acesso para familiares acompanharem informações importantes.",
  },
  {
    question: "O que eu consigo ver no painel?",
    answer:
      "Você consegue ver quem são os residentes ativos, quais medicamentos estão cadastrados, quais prescrições estão em andamento e quais medicações precisam de atenção no dia. O painel também destaca atrasos e pendências para a equipe agir mais rápido.",
  },
  {
    question: "Como o sistema ajuda na rotina dos medicamentos?",
    answer:
      "Depois que uma prescrição é cadastrada, a ZeloTech monta a agenda de horários automaticamente. A equipe acompanha a lista do dia e registra o que aconteceu com cada medicação, como administrada, recusada, perdida ou cancelada.",
  },
  {
    question: "Preciso cadastrar tudo manualmente todos os dias?",
    answer:
      "Não. As informações principais ficam salvas no sistema. Residentes, medicamentos e prescrições podem ser reutilizados, e a agenda de medicação é criada a partir das prescrições cadastradas.",
  },
  {
    question: "Os familiares podem acompanhar o cuidado?",
    answer:
      "Sim. A instituição pode liberar acessos para familiares vinculados a um residente. Assim, a família acompanha as informações permitidas com mais tranquilidade e proximidade.",
  },
  {
    question: "O sistema mostra relatórios?",
    answer:
      "Sim. A ZeloTech reúne relatórios sobre medicações, administrações realizadas, ocorrências como atrasos ou recusas, e também o histórico do residente.",
  },
];

export const footerColumns = [
  {
    title: "Plataforma",
    links: [
      "Como funciona",
      "Para instituições",
      "Para famílias",
      "Planos e preços",
      "Integrações",
    ],
  },
  {
    title: "Empresa",
    links: ["Sobre nós", "Blog", "Cases de sucesso", "Parceiros", "Carreiras"],
  },
  {
    title: "Suporte",
    links: [
      "Central de ajuda",
      "Documentação API",
      "Status do sistema",
      "0800 000 0000",
      "suporte@zelotech.com.br",
    ],
  },
];
