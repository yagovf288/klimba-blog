import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from 'astro:env/server';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, whatsapp, feedback, postSlug } = body;

    // Validações básicas obrigatórias
    if (!name || !email || !whatsapp) {
      return new Response(
        JSON.stringify({ error: 'Campos Nome, E-mail e WhatsApp são obrigatórios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
      db: { schema: 'blog' }
    });

    // Inserir registro na tabela blog.leads
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        feedback: feedback ? feedback.trim() : null,
        post_slug: postSlug ? postSlug.trim() : null
      })
      .select();

    if (error) {
      console.error("Erro ao salvar lead no Supabase:", error);
      return new Response(
        JSON.stringify({ error: 'Erro ao gravar informações no banco de dados: ' + error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, lead: data[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error("Erro interno no endpoint de leads:", err);
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
