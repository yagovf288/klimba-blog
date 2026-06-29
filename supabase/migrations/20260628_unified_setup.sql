-- =====================================================================
-- MIGRATION UNIFICADA DE SETUP - KLIMBA BLOG
-- Executar este script no SQL Editor do Supabase para configurar o banco.
-- =====================================================================

-- 1. CRIAÇÃO DOS SCHEMAS
CREATE SCHEMA IF NOT EXISTS blog;
CREATE SCHEMA IF NOT EXISTS analytics;

-- 2. TABELAS DO SCHEMA BLOG
-- Tabela de Autores
CREATE TABLE IF NOT EXISTS blog.authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Posts
CREATE TABLE IF NOT EXISTS blog.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT NULL,
    content TEXT NOT NULL,
    category TEXT NULL,
    author_id UUID NULL,
    publish_date TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    read_time TEXT NULL,
    image_url TEXT NULL,
    is_featured BOOLEAN NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    CONSTRAINT posts_pkey PRIMARY KEY (id),
    CONSTRAINT posts_slug_key UNIQUE (slug),
    CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES blog.authors (id) ON DELETE SET NULL,
    CONSTRAINT posts_category_check CHECK (
        category = ANY (
            ARRAY[
                'TRAZER_CLIENTES'::text,
                'FAZER_VOLTAR'::text,
                'VENDER_MAIS'::text,
                'DICAS_ZAP'::text,
                'CONHECER_CLIENTE'::text
            ]
        )
    )
);

-- Índices do Blog
CREATE INDEX IF NOT EXISTS idx_posts_slug ON blog.posts USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON blog.posts USING btree (category);
CREATE INDEX IF NOT EXISTS idx_posts_publish_date ON blog.posts USING btree (publish_date DESC);

-- Tabela de Leads (Captura do Chatbot)
CREATE TABLE IF NOT EXISTS blog.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    feedback TEXT,
    post_slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELAS DO SCHEMA ANALYTICS
-- Visualizações de Página
CREATE TABLE IF NOT EXISTS analytics.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    url TEXT NOT NULL,
    path TEXT NOT NULL,
    referrer TEXT NULL,
    browser TEXT NULL,
    os TEXT NULL,
    device_type TEXT NULL,
    screen_width INTEGER NULL,
    screen_height INTEGER NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sessões (Tempo de Leitura)
CREATE TABLE IF NOT EXISTS analytics.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration_seconds INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cliques dos Usuários
CREATE TABLE IF NOT EXISTS analytics.clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    url TEXT NOT NULL,
    element_id TEXT NULL,
    element_class TEXT NULL,
    element_text TEXT NULL,
    target_url TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices do Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session_id ON analytics.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_created_at ON analytics.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_heartbeat ON analytics.sessions(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_session_id ON analytics.clicks(session_id);

-- 4. CONFIGURAÇÃO DO BUCKET DE IMAGENS (Supabase Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

-- Excluir políticas antigas para evitar duplicações
DROP POLICY IF EXISTS "Allow public select on blog" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon insert on blog" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon update on blog" ON storage.objects;

-- Criar políticas de leitura e escrita para o bucket 'blog'
CREATE POLICY "Allow public select on blog" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'blog');
CREATE POLICY "Allow anon insert on blog" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'blog');
CREATE POLICY "Allow anon update on blog" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'blog');

-- 5. PERMISSÕES DE ACESSO DO USUÁRIO ANON (API REST)
-- Desativa segurança de linha nas tabelas do blog (administradas pelo painel restrito)
ALTER TABLE blog.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog.authors DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog.leads DISABLE ROW LEVEL SECURITY;

-- Liberar privilégios para o schema 'analytics'
GRANT USAGE ON SCHEMA analytics TO anon;
GRANT USAGE ON SCHEMA analytics TO authenticated;
GRANT USAGE ON SCHEMA analytics TO service_role;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO service_role;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT ALL ON TABLES TO service_role;
