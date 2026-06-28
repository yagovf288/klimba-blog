import type { APIRoute } from 'astro';
import { geminiService } from '../../services/geminiService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros "title" e "content" são obrigatórios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const insight = await geminiService.getArticleInsight(title, content);

    return new Response(
      JSON.stringify({ insight }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Erro no endpoint /api/insight:", error);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar a requisição de IA.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
