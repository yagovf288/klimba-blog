-- Criar tabela de Captura de Leads do Chatbot no schema 'blog'
CREATE TABLE IF NOT EXISTS blog.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    feedback TEXT,
    post_slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Desativa RLS para permitir inserções seguras pelo backend SSR sem necessidade de sessão
ALTER TABLE blog.leads DISABLE ROW LEVEL SECURITY;
