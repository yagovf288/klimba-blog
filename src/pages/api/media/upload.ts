import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, API_KEY, GEMINI_API_KEY } from 'astro:env/server';

const secretApiKey = API_KEY || GEMINI_API_KEY || '';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Validar Autenticação (API Key)
    const authHeader = request.headers.get('Authorization') || request.headers.get('X-API-Key') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!secretApiKey || token !== secretApiKey) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Token de autenticação inválido.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Coletar dados da imagem (Multipart Form Data)
    const formData = await request.formData();
    const imageFile = formData.get('file') as File;
    const customName = formData.get('fileName')?.toString() || '';

    if (!imageFile || imageFile.size === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum arquivo enviado. Certifique-se de anexar o arquivo na chave "file" no FormData.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Determinar o nome do arquivo final
    const fileExt = imageFile.name.split('.').pop() || 'png';
    const cleanFileName = customName 
      ? customName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + `.${fileExt}`
      : `remote-${Date.now()}.${fileExt}`;
    
    const filePath = `images/${cleanFileName}`;

    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
      db: { schema: 'blog' }
    });

    // 4. Upload no bucket 'blog'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: true
      });

    if (uploadError) {
      console.error("Erro no upload do Storage via API:", uploadError);
      return new Response(
        JSON.stringify({ error: 'Erro no Storage do Supabase: ' + uploadError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Obter URL Pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('blog')
      .getPublicUrl(filePath);

    return new Response(
      JSON.stringify({ success: true, url: publicUrl, fileName: cleanFileName }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error("Erro interno no upload de mídia remoto:", err);
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor: ' + err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
