import { createClient } from '@supabase/supabase-js';
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from 'astro:env/server';

const supabaseUrl = VITE_SUPABASE_URL || 'https://bmwexlxsjznbpyoqxvfu.supabase.co';
const supabaseKey = VITE_SUPABASE_ANON_KEY;

// Inicializa o cliente conectado ao schema 'analytics'
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'analytics'
  }
});

export const analyticsService = {
  // Registrar uma visualização de página
  async logPageView(data: {
    session_id: string;
    url: string;
    path: string;
    referrer: string;
    browser: string;
    os: string;
    device_type: string;
    screen_width: number;
    screen_height: number;
  }) {
    const { error } = await supabase
      .from('page_views')
      .insert({
        session_id: data.session_id,
        url: data.url,
        path: data.path,
        referrer: data.referrer || null,
        browser: data.browser,
        os: data.os,
        device_type: data.device_type,
        screen_width: data.screen_width,
        screen_height: data.screen_height
      });

    if (error) {
      console.error("Erro ao registrar Page View no Supabase:", error);
      throw error;
    }
  },

  // Registrar ou atualizar a duração de uma sessão (Heartbeat)
  async logSessionDuration(session_id: string, duration_seconds: number) {
    const { error } = await supabase
      .from('sessions')
      .upsert(
        {
          session_id,
          last_heartbeat: new Date().toISOString(),
          duration_seconds
        },
        { onConflict: 'session_id' }
      );

    if (error) {
      console.error("Erro ao atualizar duração de sessão no Supabase:", error);
      throw error;
    }
  },

  // Registrar um evento de clique
  async logClick(data: {
    session_id: string;
    url: string;
    element_id: string;
    element_class: string;
    element_text: string;
    target_url: string;
  }) {
    const { error } = await supabase
      .from('clicks')
      .insert({
        session_id: data.session_id,
        url: data.url,
        element_id: data.element_id || null,
        element_class: data.element_class || null,
        element_text: data.element_text || null,
        target_url: data.target_url || null
      });

    if (error) {
      console.error("Erro ao registrar clique no Supabase:", error);
      throw error;
    }
  }
};
