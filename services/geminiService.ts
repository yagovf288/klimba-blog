
import { GoogleGenAI } from "@google/genai";

export const geminiService = {
  async getArticleInsight(title: string, content: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é o estrategista chefe da Klimba. Analise o seguinte artigo e gere um insight estratégico ultra-conciso (máximo 3 parágrafos) focado em como lojistas podem usar essa informação para gerar demanda inteligente, aumentar a recorrência ou melhorar o CRM no varejo físico:
        
        Título: ${title}
        Conteúdo: ${content.substring(0, 3000)}`, // Extended limit slightly
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
