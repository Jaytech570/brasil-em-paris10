

import { GoogleGenAI, Type } from "@google/genai";

export const parseImportText = async (rawText: string) => {
  if (!process.env.API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extraia dados estruturados deste texto: "${rawText}"`,
      config: {
        systemInstruction: `Você é um analista de dados para uma comunidade brasileira em Paris. 
        Classifique como "market" (serviços), "job" (empregos) ou "place" (lugares). 
        Extraia campos relevantes (title, price, company, address, whatsapp, etc). 
        Retorne estritamente JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["market", "job", "place"] },
            data: { type: Type.OBJECT }
          },
          required: ["type", "data"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (e) {
    console.error(e);
    return null;
  }
};
