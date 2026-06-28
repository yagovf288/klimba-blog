import React, { useState } from 'react';

interface AiInsightProps {
  postTitle: string;
  postContent: string;
}

const AiInsight: React.FC<AiInsightProps> = ({ postTitle, postContent }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar insights');
      }

      const data = await response.json();
      setInsight(data.insight || 'Não foi possível obter os insights.');
    } catch (error) {
      console.error(error);
      setInsight('Erro ao conectar-se à Klimba Intelligence. Verifique sua chave de API.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
      
      {insight ? (
        <div className="text-white animate-in fade-in slide-in-from-bottom-4 relative z-10">
          <div className="whitespace-pre-line leading-relaxed text-lg bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-4xl border border-white/10 shadow-inner font-body">
            {insight}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 relative z-10">
          <p className="text-slate-300 text-lg mb-10 italic max-w-xl mx-auto font-body">
            Gere insights instantâneos para este artigo usando nossa rede neural proprietária.
          </p>
          <button 
            onClick={fetchInsight}
            disabled={loading}
            className="inline-flex items-center gap-4 px-10 py-5 bg-primary text-secondary tracking-widest text-xs uppercase rounded-full font-black hover:bg-primary-hover transition-all disabled:opacity-50 shadow-xl hover:shadow-primary/20 active:scale-95"
          >
            {loading ? (
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
  );
};

export default AiInsight;
