import React, { useState } from 'react';

interface AiInsightProps {
  postTitle: string;
  postContent: string;
  postSlug: string;
}

type ChatState = 'welcome' | 'lead_capture' | 'loading' | 'insight';

// Função utilitária para converter Markdown simples em HTML com classes Tailwind
const parseMarkdownToHtml = (markdown: string): string => {
  let html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Títulos: ### Subtítulo ou ## Título
  html = html.replace(/^### (.*$)/gim, '<h5 class="text-lg font-black text-primary mt-6 mb-3 font-display">$1</h5>');
  html = html.replace(/^## (.*$)/gim, '<h4 class="text-xl font-black text-primary mt-6 mb-3 font-display">$1</h4>');
  html = html.replace(/^# (.*$)/gim, '<h3 class="text-2xl font-black text-primary mt-6 mb-3 font-display">$1</h3>');

  // Negrito: **texto**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-primary">$1</strong>');

  // Itálico: *texto*
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');

  // Listas não ordenadas: - item ou * item
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-6 list-disc text-slate-300 mb-2 leading-relaxed font-body">$1</li>');

  // Parágrafos e espaçamento
  const sections = html.split('\n');
  const processed = sections.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    
    if (trimmed.startsWith('<h') || trimmed.startsWith('<li')) {
      return line;
    }
    
    return `<p class="mb-4 leading-relaxed text-slate-300 font-body">${line}</p>`;
  });

  return processed.filter(p => p).join('\n');
};

const AiInsight: React.FC<AiInsightProps> = ({ postTitle, postContent, postSlug }) => {
  const [chatState, setChatState] = useState<ChatState>('welcome');
  const [feedback, setFeedback] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [insight, setInsight] = useState<string>('');
  const [loadingText, setLoadingText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [utmParams, setUtmParams] = useState({ source: '', medium: '', campaign: '' });

  // Capturar parâmetros UTM da URL na montagem do componente no cliente
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUtmParams({
        source: params.get('utm_source') || '',
        medium: params.get('utm_medium') || '',
        campaign: params.get('utm_campaign') || ''
      });
    }
  }, []);

  // Transição de Feedback -> Captura de Lead
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Por favor, compartilhe sua opinião antes de prosseguir.');
      return;
    }
    setError('');
    setChatState('lead_capture');
  };

  // Enviar Lead + Buscar Insight da IA do Gemini
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setError('');
    setChatState('loading');
    setLoadingText('Registrando lead...');

    try {
      // 1. Salvar Lead no Supabase via API
      const leadResponse = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          feedback,
          postSlug,
          utmSource: utmParams.source || null,
          utmMedium: utmParams.medium || null,
          utmCampaign: utmParams.campaign || null
        })
      });

      if (!leadResponse.ok) {
        const leadErr = await leadResponse.json();
        throw new Error(leadErr.error || 'Falha ao salvar lead.');
      }

      // 2. Chamar IA do Gemini para gerar o Insight
      setLoadingText('Sintonizando Klimba Intelligence...');
      const aiResponse = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          content: postContent
        })
      });

      if (!aiResponse.ok) {
        throw new Error('Falha ao gerar insights da IA.');
      }

      const aiData = await aiResponse.json();
      setInsight(aiData.insight || 'Insight estratégico gerado com sucesso.');
      setChatState('insight');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar requisição. Tente novamente.');
      setChatState('lead_capture');
    }
  };

  return (
    <div className="bg-secondary rounded-[2.5rem] p-10 md:p-14 border border-white/5 shadow-2xl relative overflow-hidden group">
      {/* Elemento Visual Decorativo */}
      <div className="absolute top-0 right-0 p-8 opacity-5 text-primary scale-150 group-hover:rotate-12 transition-transform duration-700 select-none pointer-events-none">
        <span className="material-symbols-outlined text-9xl">psychology</span>
      </div>
      
      {/* Cabeçalho Fixo */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 relative z-10">
        <div className="bg-primary size-14 rounded-3xl flex items-center justify-center text-secondary shadow-lg rotate-6">
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
        </div>
        <div>
          <h3 className="text-2xl font-black text-primary font-display">Klimba Intelligence</h3>
          <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Inteligência Artificial e CRM</p>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        
        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-in fade-in">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {/* FLUXO 1: Boas-vindas e Pergunta de Feedback */}
        {chatState === 'welcome' && (
          <form onSubmit={handleFeedbackSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl text-white font-body leading-relaxed">
              <p className="text-lg font-medium text-slate-200">
                Olá! Sou o **Klimba Intelligence**. 🤖
              </p>
              <p className="mt-2 text-slate-300 font-body">
                O que você achou de mais valioso ou relevante neste artigo sobre CRM de varejo? Compartilhe abaixo para iniciar nossa análise estratégica.
              </p>
            </div>

            <textarea
              required
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="ex: Gostei da explicação sobre como a automação de mensagens economiza tempo..."
              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-3xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-body leading-relaxed"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-secondary tracking-widest text-xs uppercase rounded-full font-black hover:bg-primary-hover transition-all shadow-xl hover:shadow-primary/20 active:scale-95 animate-pulse"
              >
                Enviar Opinião
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {/* FLUXO 2: Captação de Lead */}
        {chatState === 'lead_capture' && (
          <form onSubmit={handleLeadSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Balão do comentário do usuário */}
            <div className="flex justify-end">
              <div className="bg-primary/10 border border-primary/20 text-slate-200 px-6 py-4 rounded-3xl text-sm italic max-w-lg font-body">
                "{feedback}"
              </div>
            </div>

            {/* Balão de resposta do Bot */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl text-white font-body leading-relaxed">
              <p className="text-lg font-medium text-slate-200">
                Sensacional! Ótimo insight. 🎯
              </p>
              <p className="mt-2 text-slate-300 font-body">
                Para que eu possa liberar a **Análise Estratégica Baseada em IA** para este post e te enviar conteúdos exclusivos para alavancar as vendas do seu negócio, informe seus dados:
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: João Silva"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-body"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="ex: (11) 99999-9999"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-body"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: joao@seuvarejo.com"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 outline-none transition-all font-body"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-secondary tracking-widest text-xs uppercase rounded-full font-black hover:bg-primary-hover transition-all shadow-xl hover:shadow-primary/20 active:scale-95"
              >
                Desbloquear Insights de IA
                <span className="material-symbols-outlined text-sm">lock_open</span>
              </button>
            </div>
          </form>
        )}

        {/* FLUXO 3: Estado de Carregamento (Loading) */}
        {chatState === 'loading' && (
          <div className="py-16 text-center animate-in fade-in zoom-in-95 space-y-4">
            <span className="animate-spin material-symbols-outlined text-5xl text-primary block mx-auto">sync</span>
            <p className="text-slate-300 text-lg font-body">{loadingText}</p>
          </div>
        )}

        {/* FLUXO 4: Sucesso e Exibição de Insights */}
        {chatState === 'insight' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Confirmação de Sucesso */}
            <div className="bg-primary/10 border border-primary/20 p-6 rounded-3xl flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-3xl shrink-0">check_circle</span>
              <div>
                <h4 className="text-lg font-black text-primary font-display">Acesso Liberado!</h4>
                <p className="text-slate-300 text-sm mt-1 font-body">
                  Parabéns, <span className="font-black text-primary">{name}</span>! Seus dados foram salvos. Abaixo está o insight estratégico preparado exclusivamente para você.
                </p>
              </div>
            </div>

            {/* Insight Gerado pela IA */}
            <div className="text-white relative">
              <div 
                className="leading-relaxed text-lg bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-4xl border border-white/10 shadow-inner font-body markdown-content"
                dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(insight) }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AiInsight;
