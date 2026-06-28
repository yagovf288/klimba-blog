# Especificação de Design: Painel Administrativo & Analytics Integrado (Supabase)

Este documento especifica a implementação do painel de administração e do sistema de monitoramento de tráfego (analytics) no blog da Klimba, utilizando um novo schema de banco de dados dedicado no Supabase.

---

## 1. Arquitetura do Banco de Dados (Migration SQL)

Abaixo está o script DDL que deve ser executado no editor SQL do Supabase. Ele cria o schema `analytics` e suas respectivas tabelas otimizadas para armazenar tráfego em tempo real, sessões e cliques dos usuários.

```sql
-- =========================================================================
-- MIGRATION: CRIAÇÃO DO SCHEMA DE ANALYTICS E TABELAS
-- Executar esta query no SQL Editor do dashboard do Supabase
-- =========================================================================

-- 1. Criação do Schema Dedicado
CREATE SCHEMA IF NOT EXISTS analytics;

-- 2. Tabela de Visualizações de Página (Page Views)
CREATE TABLE IF NOT EXISTS analytics.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    url TEXT NOT NULL,
    path TEXT NOT NULL,
    referrer TEXT,
    browser TEXT,
    os TEXT,
    device_type TEXT, -- mobile, tablet, desktop
    screen_width INTEGER,
    screen_height INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Duração de Sessão (Heartbeats / Time on Page)
CREATE TABLE IF NOT EXISTS analytics.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration_seconds INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Cliques e Interações (Eventos de Clique)
CREATE TABLE IF NOT EXISTS analytics.clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    url TEXT NOT NULL,
    element_id TEXT,
    element_class TEXT,
    element_text TEXT,
    target_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Índices de Performance para Consultas Rápidas no Dashboard
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON analytics.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON analytics.page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON analytics.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_heartbeat ON analytics.sessions(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_clicks_session_id ON analytics.clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON analytics.clicks(created_at);
```

---

## 2. Etapas de Execução do Painel de Admin & Analytics

### Etapa 1: Implementação do Script de Rastreamento (Analytics)
**Objetivo**: Capturar e registrar visitas, tempo de leitura (duração) e cliques dos usuários no banco de dados através de APIs internas do Astro.

*   **Ações**:
    1. Criar um script leve em vanilla JS (`src/components/AnalyticsTracker.astro`) e importá-lo no `Layout.astro`.
    2. Gerar e ler um identificador de sessão (`session_id` via UUIDv4) salvo no `sessionStorage`.
    3. Criar a rota de API em Astro `/pages/api/analytics/track.ts` que recebe os payloads do cliente e os grava de forma assíncrona nas tabelas do schema `analytics` do Supabase.
    4. Implementar sistema de batimento cardíaco (heartbeat) a cada 15 segundos ou evento `visibilitychange` (usando `navigator.sendBeacon`) para registrar o tempo total do usuário na página de forma fiel.
    5. Capturar cliques em links externos, botões e elementos importantes.
*   **Critérios de Aceite**:
    - Ao carregar qualquer página, uma requisição POST é disparada para `/api/analytics/track` com os dados corretos da máquina (dispositivo, sistema, etc.).
    - Se o usuário fechar a página ou navegar, a duração é devidamente computada na tabela `analytics.sessions`.
    - Os dados são inseridos diretamente no schema `analytics` com sucesso.

---

### Etapa 2: Criação da Autenticação do Administrador
**Objetivo**: Proteger as rotas do painel administrativo contra acessos não autorizados.

*   **Ações**:
    1. Habilitar login via Supabase Auth na aplicação.
    2. Criar a página de Login `/admin/login` contendo formulário de e-mail e senha.
    3. Criar um middleware em Astro (`src/middleware.ts`) que intercepta requisições nas rotas `/admin/*` (com exceção de `/admin/login`) verificando o token JWT da sessão do Supabase nos cookies. Caso inválido ou expirado, redireciona o usuário para `/admin/login`.
*   **Critérios de Aceite**:
    - Tentar acessar `/admin` sem estar autenticado resulta em redirecionamento imediato para `/admin/login`.
    - Login efetuado com sucesso redireciona para o painel administrativo e salva o token nos cookies com expiração segura.

---

### Etapa 3: Desenvolvimento do Dashboard do Painel de Admin
**Objetivo**: Criar a interface visual para gerenciar publicações (posts e autores) e visualizar as estatísticas de tráfego do Analytics.

*   **Ações**:
    1. **Visualizador de Métricas (Analytics)**: Criar gráficos e contadores de visualizações, tempo médio de leitura e cliques mais comuns direto no painel principal do `/admin`.
    2. **Gerenciador de Artigos**: Tela exibindo a lista de todos os posts com botões de "Editar", "Excluir" e "Criar Novo Artigo".
    3. **Formulário de Postagem**: Editor de post contendo campos: Título, Slug, Excerpt, Categoria, Autor, Tempo de Leitura, URL da Imagem, Conteúdo (com suporte a markdown) e checkbox de Destaque.
*   **Critérios de Aceite**:
    - O administrador consegue criar um novo post e vê-lo refletido instantaneamente na home do blog.
    - O administrador consegue editar textos e atualizar imagens de postagens existentes.
    - Gráficos no painel mostram as estatísticas de visualização coletadas em tempo real.
