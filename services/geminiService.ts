import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// IMPORTANT: API Key comes from process.env.API_KEY as per instructions
const apiKey = process.env.API_KEY;

// We wrap initialization in a getter or check to handle potential missing keys gracefully in UI
const getAiClient = () => {
  if (!apiKey) {
    console.warn("API Key for Gemini is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Summarizes a legal document text or provides advice based on a query.
 */
export const getLegalAdvice = async (query: string, context?: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Sistema de IA no configurado. Contacte al administrador.";

  try {
    const model = ai.models;
    
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

    const response = await model.generateContent({
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