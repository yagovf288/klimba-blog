import { createClient } from '@supabase/supabase-js';
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from 'astro:env/server';

export async function onRequest(context: any, next: any) {
  const url = new URL(context.request.url);

  // Proteger apenas rotas sob /admin, exceto a tela de login em si
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const accessToken = context.cookies.get('sb-access-token')?.value;
    const refreshToken = context.cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return context.redirect('/admin/login');
    }

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false
      }
    });

    // Validar o token de acesso no servidor do Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      // Se o token estiver inválido ou expirado, tenta renovar usando o refresh token
      if (refreshToken) {
        const { data, error: refreshError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (!refreshError && data.session) {
          // Atualiza os cookies com os novos tokens e prossegue
          context.cookies.set('sb-access-token', data.session.access_token, { path: '/', httpOnly: true, secure: true });
          context.cookies.set('sb-refresh-token', data.session.refresh_token, { path: '/', httpOnly: true, secure: true });
          return next();
        }
      }

      // Se falhar a renovação, remove cookies inválidos e redireciona
      context.cookies.delete('sb-access-token', { path: '/' });
      context.cookies.delete('sb-refresh-token', { path: '/' });
      return context.redirect('/admin/login');
    }
  }

  return next();
}
