
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#f0f2f4]">
        <div className="px-4 md:px-10 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4 text-secondary">
            <a href="https://klimba.com.br/" className="flex items-center gap-2">
              <img
                src="assets/klimba.svg"
                style={{ height: '32px' }}
                alt="Klimba"
              />
              <span className="text-2xl font-black tracking-tight font-display">Klimba</span>
            </a>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a
              className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
              href="https://klimba.com.br/solucoes"
            >
              Soluções
            </a>
            <a
              className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
              href="https://klimba.com.br/blog"
            >
              Blog
            </a>
            <a
              className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
              href="https://klimba.com.br/#contato"
            >
              Contato
            </a>
          </div>
          <button
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-secondary shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all hover:scale-105"
            onClick={() => window.location.href = 'https://app.klimba.com.br'}
          >
            Começar Agora
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="bg-secondary text-slate-400 py-20 border-t border-slate-800"
        id="contato"
      >
        <div
          className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center md:items-start gap-12"
        >
          <div className="flex flex-col gap-6 text-center md:text-left">
            <div
              className="flex items-center gap-2 justify-center md:justify-start text-white"
            >
              <img
                src="assets/klimba.svg"
                style={{ height: '40px', filter: 'brightness(0) invert(1)' }}
                alt="Klimba"
              />
              <span className="text-3xl font-black tracking-tight font-display">Klimba</span>
            </div>
            <p className="text-base max-w-xs leading-relaxed">
              Gere Demanda Inteligente. Transforme tráfego em recorrência e aumente seu LTV.
            </p>
          </div>
          <div className="flex gap-16 text-sm text-left">
            <div className="flex flex-col gap-4">
              <span className="text-white font-bold mb-2 uppercase tracking-widest text-xs">Plataforma</span>
              <a className="hover:text-primary transition-colors" href="https://klimba.com.br/solucoes">Soluções</a>
              <a className="hover:text-primary transition-colors" href="https://klimba.com.br/blog">Blog</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-white font-bold mb-2 uppercase tracking-widest text-xs">Suporte</span>
              <a
                className="hover:text-primary transition-colors"
                href="mailto:suporte@klimba.com.br"
                >Fale Conosco</a
              >
              <a className="hover:text-primary transition-colors" href="https://linkedin.com/company/klimba">LinkedIn</a>
            </div>
          </div>
        </div>
        <div
          className="max-w-7xl mx-auto px-4 md:px-10 mt-20 pt-8 border-t border-white/5 text-center md:text-left text-xs tracking-wider"
        >
          © <span>{currentYear}</span> Klimba. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
