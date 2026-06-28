import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.GEMINI_API_KEY || 
               import.meta.env.API_KEY || 
               (typeof process !== 'undefined' ? (process.env.GEMINI_API_KEY || process.env.API_KEY) : '') || 
               '';

export const geminiService = {
  async getArticleInsight(title: string, content: string): Promise<string> {
    if (!apiKey) {
      console.warn("Aviso: Chave GEMINI_API_KEY não configurada no servidor.");
      return "A Klimba Intelligence está temporariamente indisponível (Chave de API não configurada).";
    }

    const ai = new GoogleGenAI({ apiKey });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é o estrategista chefe da Klimba. Analise o seguinte artigo e gere um insight estratégico ultra-conciso (máximo 3 parágrafos) focado em como lojistas podem usar essa informação para gerar demanda inteligente, aumentar a recorrência ou melhorar o CRM no varejo físico:
        
        Título: ${title}
        Conteúdo: ${content.substring(0, 3000)}`,
        config: {
          temperature: 0.8,
        }
      });
      return response.text || "A Klimba Intelligence está temporariamente indisponível.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Erro ao sintonizar com a Klimba Intelligence.";
    }
  }
};
