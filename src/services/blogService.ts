import { createClient } from '@supabase/supabase-js';
import { Category } from '../types';
import type { BlogPost, Author, PageInfo } from '../types';
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from 'astro:env/server';

const supabaseUrl = VITE_SUPABASE_URL || 'https://bmwexlxsjznbpyoqxvfu.supabase.co';
const supabaseKey = VITE_SUPABASE_ANON_KEY;

// Conectando ao Supabase no schema 'blog'
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'blog'
  }
});

const formatDate = (raw: string | undefined): string => {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return raw;
  }
};

const transformPost = (record: any): BlogPost => ({
  id: record.id?.toString() || record.Id?.toString() || '',
  title: record.title,
  slug: record.slug,
  excerpt: record.excerpt,
  content: record.content,
  category: record.category as Category,
  authorId: record.author_id?.toString() || record.authorId?.toString(),
  publishDate: formatDate(record.publish_date || record.publishDate),
  readTime: record.read_time || record.readTime,
  imageUrl: record.image_url || record.imageUrl,
  isFeatured: record.is_featured ?? record.isFeatured ?? false,
  status: record.status as 'DRAFT' | 'PUBLISHED',
  seoTitle: record.seo_title || record.seoTitle,
  seoDescription: record.seo_description || record.seoDescription
});

const transformAuthor = (record: any): Author => ({
  id: record.id?.toString() || record.Id?.toString() || '',
  name: record.name,
  role: record.role,
  avatarUrl: record.avatar_url || record.avatarUrl
});

export const blogService = {
  async getAllPosts(page: number = 1, pageSize: number = 25): Promise<{ list: BlogPost[], pageInfo: PageInfo }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('status', 'PUBLISHED')
      .range(from, to)
      .order('publish_date', { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Erro no Supabase (getAllPosts):", error);
      // Fallback para ordenar por 'id' se 'publish_date' não existir ou der erro
      const retry = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('status', 'PUBLISHED')
        .range(from, to)
        .order('id', { ascending: false });
      
      if (retry.error) throw retry.error;
      
      return {
        list: retry.data.map(transformPost),
        pageInfo: {
          totalRows: retry.count || 0,
          page,
          pageSize,
          isFirstPage: page === 1,
          isLastPage: (retry.count || 0) <= from + pageSize
        }
      };
    }

    return {
      list: (data || []).map(transformPost),
      pageInfo: {
        totalRows: count || 0,
        page,
        pageSize,
        isFirstPage: page === 1,
        isLastPage: (count || 0) <= from + pageSize
      }
    };
  },

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'PUBLISHED')
      .single();

    if (error) {
      console.error("Erro no Supabase (getPostBySlug):", error);
      return undefined;
    }
    return transformPost(data);
  },

  async getAuthorById(id: string): Promise<Author | undefined> {
    if (!id) return undefined;
    
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
       // Fallback: busca por nome se o ID não for correspondência exata
       const { data: list } = await supabase.from('authors').select('*').limit(10);
       const record = list?.find(a => a.id?.toString() === id);
       return record ? transformAuthor(record) : undefined;
    }
    return transformAuthor(data);
  },

  async getPostsByCategory(category: Category, page: number = 1): Promise<{ list: BlogPost[], pageInfo: PageInfo }> {
    if (category === Category.TODOS) return this.getAllPosts(page);
    
    const pageSize = 25;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('category', category)
      .eq('status', 'PUBLISHED')
      .range(from, to)
      .order('publish_date', { ascending: false });

    if (error) throw error;

    return {
      list: (data || []).map(transformPost),
      pageInfo: {
        totalRows: count || 0,
        page,
        pageSize,
        isFirstPage: page === 1,
        isLastPage: (count || 0) <= from + pageSize
      }
    };
  },

  async searchPosts(query: string): Promise<BlogPost[]> {
    if (!query) return [];
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'PUBLISHED')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .limit(50);

    if (error) {
      console.error("Erro no Supabase (searchPosts):", error);
      return [];
    }
    return (data || []).map(transformPost);
  }
};
