# 🚀 Boilerplate Blog Engine: Guia Oficial de Setup e Deploy

Este repositório é um modelo padrão (boilerplate) de alto desempenho para criação de blogs corporativos rápidos e focados em SEO. Desenvolvido com **Astro SSR (Server-Side Rendering)**, ele conta com **AI Intelligence (Chatbot IA com captura de leads)**, **Analytics Proprietário integrado** e um **Painel Administrativo completo (/admin)** conectado ao **Supabase como CMS**.

O deploy é otimizado para o **Cloudflare Pages**, rodando na infraestrutura ultra-rápida de Edge Workers com custo praticamente zero.

---

## 🛠️ Passo 1: Configuração do Supabase (Banco de Dados e CMS)

O Supabase servirá como nosso banco de dados, motor de autenticação e provedor de armazenamento de imagens de postagem.

### 1. Criar Conta e Projeto
1. Acesse o site do [Supabase](https://supabase.com/) e crie uma conta gratuita.
2. Crie um novo projeto, defina um nome (ex: `blog-cliente-xyz`), escolha uma senha forte para o banco de dados e selecione a região do servidor mais próxima (ex: `sa-east-1` para São Paulo).

### 2. Rodar a Migration Unificada
1. Com o projeto criado, no menu lateral esquerdo, clique em **SQL Editor**.
2. Clique em **New Query** (Nova consulta).
3. Copie todo o conteúdo do arquivo local [supabase/migrations/20260628_unified_setup.sql](file:///a:/Klimba/klimba-blog/supabase/migrations/20260628_unified_setup.sql) e cole no editor.
4. Clique em **Run** (Executar). 
   *Isso criará automaticamente os schemas `blog` e `analytics`, todas as tabelas necessárias, os índices de performance, o bucket de imagens no Storage e liberará os privilégios da API.*

### 3. Liberar o Schema Analytics na API do Supabase
Para que o nosso sistema de tracking no cliente envie os acessos direto para o schema `analytics` usando a chave anônima, é necessário habilitar a exposição dele:
1. Vá em **Project Settings** (engrenagem no menu lateral inferior) > **API**.
2. Procure pela opção **Exposed schemas** (Schemas expostos).
3. Adicione o schema **`analytics`** à lista (além do `public` que já vem por padrão).
4. Salve as alterações.
5. Volte no SQL Editor e execute o comando abaixo para forçar a API a atualizar seu cache imediatamente:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

### 4. Criar Conta do Administrador (Para o Painel /admin)
Para acessar o painel administrativo do blog e gerenciar os posts:
1. No menu lateral esquerdo, vá em **Authentication** > **Users**.
2. Clique em **Add User** > **Create User**.
3. Insira o E-mail e Senha que o administrador utilizará para fazer login e clique em **Save**.

---

## 🔑 Passo 2: Obter Chave de API do Gemini (IA)

O chatbot interativo "AI Intelligence" gera insights automáticos sobre os posts em troca de leads. Para fazê-lo funcionar:
1. Acesse o [Google AI Studio](https://aistudio.google.com/).
2. Faça login com uma conta Google e clique em **Get API Key** (Obter Chave de API).
3. Crie uma chave nova e copie-a.

---

## ⚡ Passo 3: Executar o Projeto Localmente

Antes de publicar, você pode testar e personalizar o blog na sua máquina local.

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   Crie um arquivo `.env` na raiz do projeto contendo as credenciais do Supabase e do Gemini:
   ```env
   # Credenciais do Supabase (Acesse no painel: Settings > API)
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_anon_key

   # Chave do Gemini IA
   GEMINI_API_KEY=sua_chave_do_gemini
   API_KEY=sua_chave_do_gemini
   ```

3. **Rodar em modo de desenvolvimento**:
   ```bash
   npm run dev
   ```
   *Acesse `http://localhost:4321` no seu navegador.*

---

## 🌐 Passo 4: Deploy no Cloudflare Pages (Produção)

O Cloudflare Pages compilará e hospedará o blog de forma totalmente gratuita e serverless.

### 1. Vincular Repositório
1. Crie uma conta no [Cloudflare](https://dash.cloudflare.com/) e acesse **Workers & Pages** > **Pages** > **Connect to Git**.
2. Vincule a sua conta do GitHub e selecione o repositório deste blog.

### 2. Configurações de Build
Durante a etapa de configuração do deploy, configure exatamente os campos abaixo:
*   **Framework preset**: `Astro`
*   **Build command**: `npm run build`
*   **Build output directory**: `dist`

### 3. Configurar Variáveis de Ambiente no Cloudflare
Ainda na tela de criação (ou posteriormente nas configurações do projeto em **Settings > Environment variables**):
1. Adicione as seguintes variáveis na seção **Production** (e opcionalmente em *Preview*):
   *   `VITE_SUPABASE_URL` = *URL do seu projeto no Supabase*
   *   `VITE_SUPABASE_ANON_KEY` = *Chave anônima do seu Supabase*
   *   `GEMINI_API_KEY` = *Sua chave do Gemini*
   *   `API_KEY` = *Sua chave do Gemini*
2. Salve e clique em **Save and Deploy**.

> ⚠️ **Importante**: Sempre que alterar qualquer variável de ambiente nas configurações do painel da Cloudflare, você deve ir na aba **Deployments** e fazer um **Redeploy** (Refazer Deploy) para que a Cloudflare compile a nova versão do código lendo as novas chaves.

---

## 📁 Estrutura do Projeto

*   `/src/layouts/Layout.astro` - Layout estrutural, cabeçalho de metatags de SEO dinâmicas e injeção do Analytics.
*   `/src/components/AnalyticsTracker.astro` - Script cliente leve para monitoramento de acessos (sessão, tempo de leitura, cliques).
*   `/src/components/AiInsight.tsx` - Componente React do **AI Intelligence** (Chatbot e captura de leads).
*   `/src/pages/admin/` - Rotas protegidas do painel administrativo (login, dashboard de métricas e CRUD de artigos).
*   `/src/pages/api/` - Roteamento de APIs internas do blog (Analytics, Insight e Leads).
*   `/src/services/` - Conectores de serviços (Supabase e Gemini).
*   `/supabase/migrations/` - Scripts SQL para rápida replicação de banco de dados.
