
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Advice } from "../types";

/**
 * Service to interact with Google Gemini AI for chess move generation and advice.
 * It uses the 'gemini-3-pro-preview' model for high-quality chess reasoning.
 */

export const getGeminiMove = async (fen: string, difficulty: Difficulty): Promise<string> => {
  // Guidelines: Always use new GoogleGenAI({ apiKey: process.env.API_KEY })
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isGrandmaster = difficulty === Difficulty.GRANDMASTER;
  const model = 'gemini-3-pro-preview';

  const systemInstructions = `You are a professional chess engine. 
    Analyze the FEN and provide the best move for the current turn.
    Current Difficulty: ${difficulty}.
    Respond ONLY with the move in SAN format (e.g., "e4", "Nf3", "O-O"). 
    NO conversational text. NO explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `FEN: ${fen}`,
      config: {
        systemInstruction: systemInstructions,
        temperature: isGrandmaster ? 0.0 : 0.7,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    // Access text directly from the response object as a property
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
        thinkingConfig: { thinkingBudget: 0 },
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
