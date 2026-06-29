
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogPost, Author } from '../types';
import { blogService } from '../services/blogService';
import { geminiService } from '../services/geminiService';

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

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

  useEffect(() => {
    const initData = async () => {
      try {
        const response = await blogService.getAllPosts();
        setAllPosts(response.list);
      } catch (e) { console.error(e); }
    };
    initData();
  }, []);

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        setIsLoading(true);
        try {
          const p = await blogService.getPostBySlug(slug);
          if (p) {
            setPost(p);
            const a = await blogService.getAuthorById(p.authorId);
            setAuthor(a || null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setAiInsight('');

            // Dynamic SEO Update for Post
            updateMetaTags({
              title: `${p.title} | Klimba Blog`,
              description: p.excerpt,
              image: p.imageUrl
            });
          }
        } catch (error) {
          console.error("Erro ao carregar artigo:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPost();
    }
  }, [slug]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return allPosts
      .filter(p => p.category === post.category && p.id !== post.id)
      .slice(0, 3);
  }, [post, allPosts]);

  const generateAiInsight = async () => {
    if (!post) return;
    setLoadingAi(true);
    const insight = await geminiService.getArticleInsight(post.title, post.content);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-secondary font-black tracking-[0.2em] text-xs animate-pulse uppercase">Conectando ao Cerebelo Klimba...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-12 bg-white rounded-4xl shadow-xl">
          <h2 className="text-3xl font-black mb-6 font-display">Artigo não encontrado</h2>
          <Link to="/" className="inline-flex h-12 items-center px-8 rounded-full bg-secondary text-primary font-bold hover:bg-secondary/90 transition-all">
            Voltar para a Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 bg-background-light">
      {/* Breadcrumbs */}
      <div className="w-full max-w-[900px] mx-auto px-6 mt-12 mb-6">
        <nav className="flex text-[10px] text-text-muted font-black uppercase tracking-[0.2em] gap-3 items-center">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link to="/" className="hover:text-primary transition-colors">Blog</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-secondary">{post.category.replace(/_/g, ' ')}</span>
        </nav>
      </div>

      {/* Article Header */}
      <div className="w-full max-w-[900px] mx-auto px-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-secondary leading-[1.1] tracking-tight mb-8 font-display">
          {post.title}
        </h1>
        <p className="text-xl md:text-2xl text-text-muted font-medium leading-relaxed mb-12 font-body max-w-3xl">
          {post.excerpt}
        </p>

        {/* Profile / Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-gray-100 py-8 mb-12 gap-8">
          <div className="flex items-center gap-5">
            <div
              className="size-16 rounded-3xl bg-gray-100 overflow-hidden ring-4 ring-white shadow-lg rotate-3"
              style={{ backgroundImage: `url('${author?.avatarUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            ></div>
            <div className="flex flex-col">
              <span className="text-base font-black text-secondary font-display">Por {author?.name || 'Equipe Klimba'}</span>
              <span className="text-xs text-text-muted font-bold tracking-widest uppercase">{author?.role || 'Growth Strategist'}</span>
            </div>
          </div>
          <div className="flex items-center gap-8 text-[11px] text-text-muted font-black tracking-widest uppercase">
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg text-primary">calendar_today</span> {post.publishDate}</span>
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg text-primary">schedule</span> {post.readTime}</span>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-[1100px] mx-auto px-4 mb-16">
        <div className="relative rounded-4xl overflow-hidden shadow-2xl border border-gray-100">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-auto object-cover max-h-[600px]"
          />
        </div>
      </div>

      {/* Article Body */}
      <article className="w-full max-w-[900px] mx-auto px-6 prose prose-lg prose-teal text-secondary font-body">
        {post.content.replace(/\\n/g, '\n').split('\n').map((paragraph, idx) => {
          const renderText = (text: string) => {
            return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-black text-secondary">{part.slice(2, -2)}</strong>;
              }
              return part;
            });
          };

          if (paragraph.startsWith('# ')) {
            return <h1 key={idx} className="text-4xl font-black text-secondary mt-16 mb-8 tracking-tight font-display leading-tight">{renderText(paragraph.replace('# ', ''))}</h1>;
          }
          if (paragraph.startsWith('## ')) {
            return <h2 key={idx} className="text-3xl font-black text-secondary mt-16 mb-6 tracking-tight font-display">{renderText(paragraph.replace('## ', ''))}</h2>;
          }
          if (paragraph.startsWith('### ')) {
            return <h3 key={idx} className="text-2xl font-black text-secondary mt-12 mb-4 tracking-tight font-display">{renderText(paragraph.replace('### ', ''))}</h3>;
          }
          if (paragraph.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-8 border-primary pl-8 py-4 my-12 italic text-2xl text-secondary font-black bg-primary/5 pr-8 rounded-4xl">
                {renderText(paragraph.replace('> ', '').replace(/"/g, ''))}
              </blockquote>
            );
          }
          if (paragraph.startsWith('- ') || paragraph.match(/^\d+\. /)) {
            return <p key={idx} className="mb-4 leading-[1.8] text-xl opacity-90 pl-6 relative before:absolute before:left-0 before:top-3 before:size-2 before:bg-primary before:rounded-full">{renderText(paragraph.replace(/^(- |\d+\. )/, ''))}</p>;
          }
          if (paragraph.trim() === '') return null;
          return <p key={idx} className="mb-10 leading-[1.8] text-xl opacity-90">{renderText(paragraph)}</p>;
        })}
      </article>

      {/* AI Insight Section */}
      <div className="w-full max-w-[900px] mx-auto px-6 mt-16 mb-20">
        <div className="bg-secondary rounded-4xl p-10 md:p-14 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-primary scale-150 group-hover:rotate-12 transition-transform duration-700">
            <span className="material-symbols-outlined text-9xl">psychology</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 relative z-10">
            <div className="bg-primary size-14 rounded-3xl flex items-center justify-center text-secondary shadow-lg rotate-6">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-primary font-display">Klimba Intelligence</h3>
              <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Análise estratégica baseada em IA</p>
            </div>
          </div>

          {aiInsight ? (
            <div className="text-white animate-in fade-in slide-in-from-bottom-4 relative z-10">
              <div className="whitespace-pre-line leading-relaxed text-lg bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-4xl border border-white/10 shadow-inner font-body">
                {aiInsight}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 relative z-10">
              <p className="text-slate-300 text-lg mb-10 italic max-w-xl mx-auto font-body">Gere insights instantâneos para este artigo usando nossa rede neural proprietária.</p>
              <button
                onClick={generateAiInsight}
                disabled={loadingAi}
                className="inline-flex items-center gap-4 px-10 py-5 bg-primary text-secondary tracking-widest text-xs uppercase rounded-full font-black hover:bg-primary-hover transition-all disabled:opacity-50 shadow-xl hover:shadow-primary/20 active:scale-95"
              >
                {loadingAi ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-lg">sync</span>
                    Sintonizando Canais...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                    Ativar Visão Estratégica
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16 border-t border-gray-100 pt-20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black text-secondary tracking-tight font-display">Aprofunde seu conhecimento</h2>
            <Link to="/" className="text-secondary font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
              Ver biblioteca <span className="material-symbols-outlined text-primary">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {relatedPosts.map(rp => (
              <article key={rp.id} className="bg-white rounded-4xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group">
                <Link to={`/post/${rp.slug}`} className="block h-56 overflow-hidden relative">
                  <img
                    src={rp.imageUrl}
                    alt={rp.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-secondary shadow-sm uppercase tracking-widest">
                    {rp.category.replace(/_/g, ' ')}
                  </div>
                </Link>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-secondary mb-4 leading-tight group-hover:text-primary transition-colors font-display">
                    <Link to={`/post/${rp.slug}`}>{rp.title}</Link>
                  </h3>
                  <p className="text-text-muted text-sm line-clamp-3 mb-8 flex-1 leading-relaxed font-body">
                    {rp.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">{rp.readTime}</span>
                    <Link to={`/post/${rp.slug}`} className="text-secondary font-black text-[10px] uppercase tracking-widest inline-flex items-center gap-2 group-hover:gap-4 transition-all">
                      Ler Artigo <span className="material-symbols-outlined text-sm text-primary">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Strategic CTA */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="relative overflow-hidden rounded-[3rem] bg-secondary p-10 md:p-16 shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-primary/10 blur-[120px]"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-3xl text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-glow"></span>
                Gere Demanda Inteligente
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight leading-[1.1] font-display">Pronto para transformar seu varejo em uma máquina de recorrência?</h3>
              <p className="text-slate-400 text-xl leading-relaxed font-medium font-body mb-0">
                O CRM WhatsApp-first que conecta sua loja ao bolso do cliente, sem atrito, sem downloads.
              </p>
            </div>
            <div className="flex flex-col gap-6 w-full lg:w-auto shrink-0">
              <button
                onClick={() => window.location.href = 'https://klimba.com.br'}
                className="flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-secondary font-black py-5 px-10 rounded-full transition-all hover:-translate-y-1 shadow-2xl shadow-primary/20 active:scale-95 uppercase tracking-widest text-xs"
              >
                Ativar Minha Loja
                <span className="material-symbols-outlined">bolt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
