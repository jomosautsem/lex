import { GoogleGenAI } from "@google/genai";

/**
 * Summarizes a legal document text or provides advice based on a query.
 */
export const getLegalAdvice = async (query: string, context?: string): Promise<string> => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Using gemini-2.5-flash for fast, efficient text tasks
    const systemInstruction = `
      Eres un asistente legal experto y formal llamado 'LexAI'. 
      Tu objetivo es ayudar a abogados y clientes a entender términos jurídicos, 
      redactar borradores de cláusulas y resumir estados de casos.
      Mantén un tono profesional, serio y ético.
      Responde siempre en Español.
    `;

    const prompt = context 
      ? `Contexto del caso: ${context}\n\nConsulta del usuario: ${query}` 
      : query;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Low temperature for more deterministic/serious answers
      }
    });

    return response.text || "No se pudo generar una respuesta.";
  } catch (error) {
    console.error("Error fetching legal advice:", error);
    return "Error al conectar con el asistente jurídico.";
  }
};