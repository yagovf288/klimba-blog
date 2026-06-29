-- =====================================================================
-- MIGRATION DE MELHORIAS ESTRUTURAIS (DRAFTS, TAGS, SEO & UTM LEADS)
-- Executar este script no SQL Editor para atualizar seu banco atual.
-- =====================================================================

-- 1. ADICIONAR STATUS E CAMPOS DE SEO NA TABELA DE POSTS
ALTER TABLE blog.posts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED')),
ADD COLUMN IF NOT EXISTS seo_title TEXT NULL,
ADD COLUMN IF NOT EXISTS seo_description TEXT NULL;

-- 2. CRIAR TABELA DE TAGS
CREATE TABLE IF NOT EXISTS blog.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT tags_slug_key UNIQUE (slug)
);

-- 3. CRIAR TABELA RELACIONAL MUITOS-PARA-MUITOS (POSTS <-> TAGS)
CREATE TABLE IF NOT EXISTS blog.posts_tags (
    post_id UUID REFERENCES blog.posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES blog.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 4. ADICIONAR CAMPOS DE RASTREAMENTO UTM NA TABELA DE LEADS
ALTER TABLE blog.leads
ADD COLUMN IF NOT EXISTS utm_source TEXT NULL,
ADD COLUMN IF NOT EXISTS utm_medium TEXT NULL,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT NULL;

-- 5. DESATIVAR RLS NAS NOVAS TABELAS DE TAGS
ALTER TABLE blog.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog.posts_tags DISABLE ROW LEVEL SECURITY;
