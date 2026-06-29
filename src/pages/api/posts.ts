import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { blogService } from '../../services/blogService';
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, API_KEY, GEMINI_API_KEY } from 'astro:env/server';

const secretApiKey = API_KEY || GEMINI_API_KEY || '';

// 1. GET: Retorna a lista de posts publicados de forma pública
export const GET: APIRoute = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.get('category') || '';

    let result;
    if (category) {
      result = await blogService.getPostsByCategory(category as any, page);
    } else {
      result = await blogService.getAllPosts(page, limit);
    }

    return new Response(
      JSON.stringify({ success: true, data: result.list, pageInfo: result.pageInfo }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar posts: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 2. POST: Cria um post remotamente (Protegido por API Key)
export const POST: APIRoute = async ({ request }) => {
  try {
    // Autenticação simples
    const authHeader = request.headers.get('Authorization') || request.headers.get('X-API-Key') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!secretApiKey || token !== secretApiKey) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Token de autenticação inválido.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { 
      title, 
      content, 
      authorId,
      category, 
      imageUrl, 
      readTime, 
      isFeatured, 
      status, 
      seoTitle, 
      seoDescription 
    } = body;

    if (!title || !content || !authorId) {
      return new Response(
        JSON.stringify({ error: 'Título, conteúdo e ID do autor são campos obrigatórios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Gerar Slug amigável automaticamente se omitido
    const slug = body.slug 
      ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : title.toLowerCase().replace(/[^a-z0-9\s]+/g, '').replace(/\s+/g, '-');

    // Gerar Excerpt automaticamente se omitido
    const excerpt = body.excerpt || content.substring(0, 160).replace(/\n/g, ' ') + '...';

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
      db: { schema: 'blog' }
    });

    const cleanAuthorId = isNaN(Number(authorId)) ? authorId : parseInt(authorId);

    // Inserir registro
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: title.trim(),
        slug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        category: category || 'TRAZER_CLIENTES',
        author_id: cleanAuthorId,
        read_time: readTime || '5 min de leitura',
        image_url: imageUrl || '',
        is_featured: !!isFeatured,
        status: status || 'PUBLISHED',
        seo_title: seoTitle ? seoTitle.trim() : null,
        seo_description: seoDescription ? seoDescription.trim() : null,
        publish_date: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error("Erro Supabase criando post remoto:", error);
      return new Response(
        JSON.stringify({ error: 'Erro ao gravar no banco: ' + error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, post: data[0] }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error("Erro interno no endpoint POST /api/posts:", err);
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
