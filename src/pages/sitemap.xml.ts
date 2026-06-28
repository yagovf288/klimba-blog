import type { APIRoute } from 'astro';
import { blogService } from '../services/blogService';

export const GET: APIRoute = async ({ site, url }) => {
  const baseUrl = site || url.origin;
  
  let posts = [];
  try {
    const response = await blogService.getAllPosts(1, 100);
    posts = response.list;
  } catch (error) {
    console.error("Erro ao carregar posts para o sitemap:", error);
  }

  const sitemapItems = posts.map(post => {
    // Formata a data se possível
    let formattedDate = new Date().toISOString().split('T')[0];
    if (post.publishDate) {
      try {
        formattedDate = new Date(post.publishDate).toISOString().split('T')[0];
      } catch (e) {
        // Fallback se a data estiver em outro formato legível
        if (post.publishDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          formattedDate = post.publishDate;
        }
      }
    }
    
    const postUrl = new URL(`/post/${post.slug}`, baseUrl).href;
    return `  <url>
    <loc>${postUrl}</loc>
    <lastmod>${formattedDate}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
${sitemapItems}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    }
  });
};
