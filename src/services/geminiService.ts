import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, API_KEY } from 'astro:env/server';
import { blogConfig } from '../blog.config';

const apiKey = GEMINI_API_KEY || API_KEY || '';

export const geminiService = {
  async getArticleInsight(title: string, content: string): Promise<string> {
    if (!apiKey) {
      console.warn("Aviso: Chave GEMINI_API_KEY não configurada no servidor.");
      return "A Inteligência Artificial está temporariamente indisponível (Chave de API não configurada).";
    }

    const ai = new GoogleGenAI({ apiKey });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${blogConfig.ai.systemInstruction}
        
        Título: ${title}
        Conteúdo: ${content.substring(0, 3000)}`,
        config: {
          temperature: 0.8,
        }
      });
      return response.text || "A Inteligência Artificial está temporariamente indisponível.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Erro ao sintonizar com a Inteligência Artificial.";
    }
  }
};
