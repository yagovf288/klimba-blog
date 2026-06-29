// blog.config.ts - Configurações centrais de marca e conteúdo do Boilerplate

export const blogConfig = {
  // Configurações Gerais da Empresa
  companyName: "Klimba",
  companyLogo: "/assets/klimba.svg", 
  companyLogoAlt: "Klimba Logo",
  companySlogan: "Gere Demanda Inteligente. Transforme tráfego em recorrência e aumente seu LTV.",

  // Configurações de SEO Padrão
  seo: {
    titleDefault: "Klimba | Blog | Gere Demanda Inteligente",
    descriptionDefault: "Insights de marketing e CRM para o varejo físico de alta recorrência.",
    defaultImage: "/assets/og-image.png", // Imagem padrão de compartilhamento
  },

  // CTA Estratégico (Exibido no final de cada artigo)
  cta: {
    badge: "Gere Demanda Inteligente",
    title: "Pronto para transformar seu varejo em uma máquina de recorrência?",
    description: "Conecte-se diretamente ao bolso do seu cliente através do WhatsApp e crie campanhas de fidelidade automáticas sem a necessidade de baixar aplicativos.",
    buttonText: "Falar com Consultor",
    buttonUrl: "https://klimba.com.br",
  },

  // Configurações da Inteligência Artificial (Chatbot)
  ai: {
    // Esse prompt orientará o comportamento e a persona da IA ao analisar o artigo
    systemInstruction: "Você é o estrategista chefe de negócios. Analise o seguinte artigo e gere um insight estratégico ultra-conciso (máximo 3 parágrafos) focado em como leitores podem aplicar essa informação na prática para alavancar seus resultados:",
  }
};
