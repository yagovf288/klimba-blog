
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, Category, PageInfo } from '../types';
import { blogService } from '../services/blogService';

const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.TODOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const updateMetaTags = (data: { title: string; description: string; image?: string }) => {
    document.title = data.title;
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', data.description);
    setMeta('og:title', data.title, 'property');
    setMeta('og:description', data.description, 'property');
    if (data.image) setMeta('og:image', data.image, 'property');
    setMeta('og:url', window.location.href, 'property');
  };

  const fetchPosts = async (page: number, append: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await blogService.getPostsByCategory(selectedCategory, page);
      if (append) {
        setPosts(prev => [...prev, ...response.list]);
      } else {
        setPosts(response.list);
      }
      setPageInfo(response.pageInfo);
    } catch (error) {
      console.error("Erro ao conectar ao banco:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchPosts(1, false);
  }, [selectedCategory]);

  const featuredPost = useMemo(() => {
    return posts.find(p => p.isFeatured) || posts[0];
  }, [posts]);

  // Dynamic SEO Update for Home
  useEffect(() => {
    updateMetaTags({
      title: 'Klimba | Gere Demanda Inteligente - Blog',
      description: 'Estratégias de retenção, CRM e marketing direto para o varejo físico. Transforme tráfego em recorrência.',
      image: featuredPost?.imageUrl || '/assets/klimba-og.png'
    });
  }, [featuredPost]);

  const handleLoadMore = () => {
    if (pageInfo && !pageInfo.isLastPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  const displayedPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.excerpt.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  return (
    <div className="animate-in fade-in duration-700 bg-background-light">
      {/* Category Sub-Nav */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 overflow-x-auto sticky top-[72px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 min-w-max">
            {Object.values(Category).map((cat) => ( cat !== undefined && (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-secondary text-primary shadow-lg shadow-secondary/10'
                    : 'text-text-muted hover:text-secondary hover:bg-gray-100'
                }`}
              >
                {cat === Category.TODOS 
                  ? 'Ver Tudo' 
                  : cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
                }
              </button>
            )))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {isLoading && posts.length === 0 ? (
          <div className="w-full h-[500px] bg-gray-200 animate-pulse rounded-4xl"></div>
        ) : featuredPost && (
          <Link to={`/post/${featuredPost.slug}`} className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch bg-white rounded-4xl shadow-xl shadow-secondary/5 border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 order-2 lg:order-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary/20 text-secondary border border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Flagship</span>
                <span className="text-text-muted text-xs font-semibold tracking-wide">{featuredPost.readTime}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-secondary leading-[1.1] mb-6 group-hover:text-primary transition-colors font-display">
                {featuredPost.title}
              </h1>
              <p className="text-text-muted text-lg md:text-xl mb-10 leading-relaxed line-clamp-3 font-body">
                {featuredPost.excerpt}
              </p>
              <div>
                <span className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-secondary text-primary font-black text-sm uppercase tracking-widest transition-all duration-300 group-hover:bg-primary group-hover:text-secondary">
                  Ler Artigo Completo
                </span>
              </div>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 h-80 lg:h-auto relative overflow-hidden">
              <img 
                src={featuredPost.imageUrl} 
                alt={featuredPost.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </Link>
        )}
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main List */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black text-secondary font-display tracking-tight">Últimos Insights</h2>
                {isLoading && (
                  <div className="flex items-center gap-2 text-primary text-[10px] font-black tracking-widest animate-pulse uppercase">
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    Refreshing
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {displayedPosts.filter(p => p.id !== featuredPost?.id).map(post => (
                <article key={post.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-500 group">
                  <Link to={`/post/${post.slug}`} className="block h-56 overflow-hidden relative">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-secondary shadow-sm">
                      {post.category.replace(/_/g, ' ')}
                    </div>
                  </Link>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-secondary mb-4 leading-tight group-hover:text-primary transition-colors font-display">
                      <Link to={`/post/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-text-muted text-sm line-clamp-3 mb-6 flex-1 leading-relaxed font-body">
                      {post.excerpt}
                    </p>
                    <Link to={`/post/${post.slug}`} className="text-secondary font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:gap-4 transition-all">
                      Continuar lendo <span className="material-symbols-outlined text-sm text-primary">arrow_forward</span>
                    </Link>
                  </div>
                </article>
              ))}
              
              {isLoading && posts.length > 0 && Array(2).fill(0).map((_, i) => (
                <div key={`load-${i}`} className="bg-white rounded-3xl border border-gray-100 overflow-hidden h-[450px] animate-pulse">
                  <div className="h-56 bg-gray-100"></div>
                  <div className="p-8 space-y-4">
                    <div className="h-8 bg-gray-100 w-3/4 rounded-lg"></div>
                    <div className="h-4 bg-gray-100 w-full rounded-lg"></div>
                    <div className="h-4 bg-gray-100 w-5/6 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>

            {pageInfo && !pageInfo.isLastPage && (
              <div className="flex justify-center mt-12">
                <button 
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="bg-white border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary font-black text-sm uppercase tracking-widest py-4 px-10 rounded-full transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? 'Carregando...' : 'Ver Artigos Antigos'}
                  {!isLoading && <span className="material-symbols-outlined">expand_more</span>}
                </button>
              </div>
            )}

            {!isLoading && displayedPosts.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <span className="material-symbols-outlined text-8xl text-gray-100 mb-6">search_off</span>
                <p className="text-text-muted font-bold text-xl uppercase tracking-widest">Nada encontrado</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-secondary mb-6">Pesquisa</h3>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-background-light border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-shadow font-body" 
                  placeholder="O que você procura?" 
                />
                <span className="material-symbols-outlined absolute left-4 top-4 text-text-muted text-xl">search</span>
              </div>
            </div>

            <div className="bg-secondary p-10 rounded-4xl border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-primary mb-4 font-display leading-tight">Gere Demanda Inteligente</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed font-body">
                  Transforme seu varejo físico com o CRM que as lojas de elite usam. Recorrência sem fricção.
                </p>
                <button 
                  onClick={() => window.location.href = 'https://klimba.com.br'}
                  className="w-full bg-primary text-secondary font-black text-xs uppercase tracking-widest py-4 rounded-full hover:bg-primary-hover transition-all"
                >
                  Conhecer a Klimba
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
