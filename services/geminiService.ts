
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Advice } from "../types";

/**
 * Service to interact with Google Gemini AI for chess move generation and advice.
 */

export const getGeminiMove = async (fen: string, difficulty: Difficulty): Promise<string> => {
  // The API Key is provided via process.env.API_KEY from vite.config.ts
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isGrandmaster = difficulty === Difficulty.GRANDMASTER;
  const model = 'gemini-3-pro-preview';

  const systemInstructions = `You are a professional chess engine. 
    Analyze the FEN and provide the best move for the current turn.
    Difficulty: ${difficulty}.
    Respond ONLY with the move in SAN format (e.g., "e4", "Nf3"). 
    NO conversational text. NO explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `FEN: ${fen}`,
      config: {
        systemInstruction: systemInstructions,
        temperature: isGrandmaster ? 0.1 : 0.8,
      },
    });

    const text = (response.text || "").trim();
    const moveMatch = text.match(/[a-hNRBQKx1-8+#=O-]+/);
    return moveMatch ? moveMatch[0] : text;
  } catch (error: any) {
    console.error("Gemini AI move error:", error);
    throw error;
  }
};

export const getGeminiAdvice = async (fen: string): Promise<Advice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Chess position (FEN): ${fen}`,
      config: {
        systemInstruction: `You are a professional chess coach. 
        Analyze the FEN. Provide the best move in SAN and a one-sentence explanation. 
        Output MUST be valid JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["move", "explanation"]
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Advice error:", error);
    throw error;
  }
};
