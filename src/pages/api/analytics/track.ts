import type { APIRoute } from 'astro';
import { analyticsService } from '../../../services/analyticsService';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return new Response(
        JSON.stringify({ error: 'Os campos "type" e "data" são obrigatórios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'pageview') {
      await analyticsService.logPageView(data);
    } else if (type === 'heartbeat') {
      await analyticsService.logSessionDuration(data.session_id, data.duration_seconds);
    } else if (type === 'click') {
      await analyticsService.logClick(data);
    } else {
      return new Response(
        JSON.stringify({ error: `Tipo de evento desconhecido: ${type}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Erro na rota de tracking de analytics:", error);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar evento de analytics.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
