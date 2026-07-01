
export enum Category {
  TODOS = 'Todos',
  TRAZER_CLIENTES = 'TRAZER_CLIENTES',
  FAZER_VOLTAR = 'FAZER_VOLTAR',
  VENDER_MAIS = 'VENDER_MAIS',
  DICAS_ZAP = 'DICAS_ZAP',
  CONHECER_CLIENTE = 'CONHECER_CLIENTE'
}

export interface Author {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: Category;
  authorId: string;
  publishDate: string;
  publishDateRaw?: string;
  readTime: string;
  imageUrl: string;
  isFeatured?: boolean;
}

export interface PageInfo {
  totalRows: number;
  page: number;
  pageSize: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface ApiResponse<T> {
  list: T[];
  pageInfo: PageInfo;
}

export interface SaveGameState {
  posts: BlogPost[];
  authors: Author[];
}
