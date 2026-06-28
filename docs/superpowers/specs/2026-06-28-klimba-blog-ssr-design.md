# Especificação de Design: Migração Klimba Blog para Astro SSR

Este documento especifica a migração do blog do Klimba de uma Single Page Application (SPA) baseada em React/Vite/HashRouter para uma aplicação Server-Side Rendered (SSR) otimizada para SEO utilizando o framework Astro, hospedada na infraestrutura do Cloudflare Pages/Workers e integrada ao Supabase como CMS.

---

## 1. Arquitetura Geral & Stack Tecnológica

- **Framework**: Astro (modo SSR)
- **Biblioteca UI**: React (apenas para componentes altamente interativos, ex: barra de pesquisa dinâmica)
- **Hospedagem/Runtime**: Cloudflare Pages utilizando o adaptador `@astrojs/cloudflare`
- **CMS**: Supabase (via HTTP REST API com a biblioteca `@supabase/supabase-js`)
- **Estilização**: Tailwind CSS (integrado nativamente via `@astrojs/tailwind`)
- **Fontes**: *Plus Jakarta Sans* (Textos e interface geral) e *Manrope* (Títulos/Display) carregadas via Google Fonts de forma otimizada.
- **Paleta de Cores**:
  - Primary (Teal): `#3BE3D2`
  - Primary Hover: `#2BCBC0`
  - Secondary (Navy): `#0F172A`
  - Background (Light): `#F6F8F8`
  - Background (Dark): `#11211F`
  - Surface (Light): `#FFFFFF`
  - Surface (Dark): `#1A2C2A`
  - Text Main: `#111717`
  - Text Muted: `#648783`

---

## 2. Etapas de Execução & Critérios de Aceite

A migração será executada sequencialmente. Nenhuma etapa deverá ser iniciada antes que a anterior atenda 100% dos seus critérios de aceite.

### Etapa 1: Inicialização do Astro e Configuração do Ambiente
**Objetivo**: Estruturar o projeto com Astro, configurar o adaptador do Cloudflare, Tailwind CSS nativo e dependências do Supabase.

*   **Ações**:
    1. Instalar as dependências do Astro e adaptadores (`astro`, `@astrojs/cloudflare`, `@astrojs/tailwind`, `@astrojs/react`).
    2. Configurar o arquivo `astro.config.mjs` com suporte a SSR (output: 'server'), adaptador Cloudflare e integrações.
    3. Migrar a configuração do Tailwind CSS presente em `index.html` para o arquivo `tailwind.config.mjs` nativo do projeto.
    4. Garantir suporte a TypeScript com a devida configuração no `tsconfig.json`.
*   **Critérios de Aceite**:
    - O comando `npm run dev` inicia o servidor Astro local sem erros.
    - O comando `npm run build` compila o projeto com sucesso para a plataforma Cloudflare (output configurado).
    - O Tailwind CSS funciona localmente com as cores institucionais do Klimba configuradas no tema.

---

### Etapa 2: Camada de Integração de Dados (Supabase Server-Side)
**Objetivo**: Ajustar os serviços para ler informações do Supabase diretamente pelo servidor utilizando variáveis de ambiente seguras do Cloudflare.

*   **Ações**:
    1. Ajustar o `src/services/blogService.ts` para carregar `SUPABASE_URL` e `SUPABASE_KEY` a partir do ambiente do Astro (`import.meta.env`).
    2. Adaptar o cliente do Supabase para funcionar em ambiente serverless sem persistência de estado do cliente.
    3. Garantir a integridade dos tipos definidos em `types.ts` correspondentes ao banco.
*   **Critérios de Aceite**:
    - O serviço é capaz de ler e retornar dados do Supabase executando no servidor.
    - Chaves do Supabase não são expostas no código final compilado para o cliente.
    - As tipagens de TypeScript (`BlogPost`, `Author`, `Category`, `PageInfo`) compilam sem erros de tipo.

---

### Etapa 3: Migração do Layout Global e Componentes de Interface
**Objetivo**: Implementar o layout estrutural e componentes visuais do cabeçalho e rodapé em Astro puro para maximizar o SEO e performance de renderização.

*   **Ações**:
    1. Criar `src/layouts/Layout.astro` que englobará todas as páginas do site.
    2. Migrar os metadados do `index.html` para o Layout, tornando-os dinâmicos através das `Astro.props`.
    3. Implementar tags de SEO essenciais: Title, Description, Open Graph (og:title, og:description, og:image, og:url), Twitter Cards, canonical tags e favicon.
    4. Criar `src/components/Header.astro` e `src/components/Footer.astro` utilizando a estrutura visual premium atual do Klimba.
*   **Critérios de Aceite**:
    - Páginas que envelopam o Layout mostram cabeçalho, rodapé e conteúdo principal idênticos ao design visual original do Klimba.
    - Inspeção do código fonte (view source) revela todas as tags meta SEO preenchidas antes de qualquer script ser executado.
    - O carregamento de fontes do Google Fonts é otimizado com preconnect.

---

### Etapa 4: Roteamento SSR e Páginas do Blog
**Objetivo**: Desenvolver as páginas dinâmicas que buscam dados e renderizam HTML no servidor.

*   **Página Principal (`src/pages/index.astro`)**:
    - Busca os posts e autores no servidor.
    - Suporta filtragem por categorias de forma performática (ex: via query params ou rotas específicas).
    - Suporta paginação.
*   **Página do Artigo (`src/pages/post/[slug].astro`)**:
    - Configura a rota dinâmica baseada no `slug`.
    - Busca as informações do post no servidor no momento da requisição.
    - Renderiza as tags meta SEO específicas daquele artigo (Título do artigo, excerpt como descrição e imagem em destaque).
*   **Barra de Busca**:
    - Mantém a experiência da barra de busca interativa, processando a pesquisa no servidor.
*   **Critérios de Aceite**:
    - O acesso a `/` renderiza a home com posts reais obtidos do Supabase.
    - O acesso a `/post/um-slug-valido` abre o artigo correto com SEO preenchido no HTML original.
    - Um slug inválido ou página inexistente retorna status `404` tratado adequadamente.

---

### Etapa 5: Otimização de SEO Avançada e Sitemaps
**Objetivo**: Habilitar a indexação e descoberta facilitada das páginas pelos motores de busca.

*   **Ações**:
    1. Integrar o `@astrojs/sitemap` no arquivo de configuração do Astro.
    2. Configurar a geração do `sitemap-index.xml` e `sitemap-0.xml` incluindo as páginas de posts dinâmicos obtidas do Supabase.
    3. Adicionar dados estruturados JSON-LD do tipo `BlogPosting` no layout do post para otimização de Rich Snippets do Google.
*   **Critérios de Aceite**:
    - Acesso a `/sitemap-index.xml` retorna um XML válido com todas as rotas do blog atualizadas.
    - Validador de dados estruturados (Schema.org) valida o JSON-LD de posts sem avisos críticos.

---

### Etapa 6: Deploy e Integração Contínua no Cloudflare Pages
**Objetivo**: Construir a infraestrutura de deploy do blog no Cloudflare Pages integrado ao repositório git.

*   **Ações**:
    1. Validar ou criar as configurações de build no `package.json` (`build: "astro build"`).
    2. Definir as variáveis de ambiente necessárias (`SUPABASE_URL`, `SUPABASE_KEY`) nas configurações da Dashboard do Cloudflare Pages.
    3. Testar o build local emulando a plataforma Cloudflare usando a CLI do wrangler se necessário.
*   **Critérios de Aceite**:
    - O projeto compila sem qualquer aviso impeditivo para produção.
    - As rotas SSR funcionam localmente utilizando o emulador de Edge Workers do Astro.
