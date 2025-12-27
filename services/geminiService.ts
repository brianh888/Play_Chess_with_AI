
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Advice } from "../types";

/**
 * Service to interact with Google Gemini API for chess move generation and advice.
 */

export const getGeminiMove = async (fen: string, difficulty: Difficulty): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isGrandmaster = difficulty === Difficulty.GRANDMASTER;
  // Use pro for complex reasoning, flash for basic levels
  const model = isGrandmaster ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const systemInstructions = `You are a professional chess engine. 
    Analyze the FEN and provide the best move for the current turn.
    Difficulty Level: ${difficulty}.
    Respond ONLY with the move in Standard Algebraic Notation (SAN) format (e.g., "e4", "Nf3", "O-O"). 
    NO conversational text. NO explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Current board position in FEN: ${fen}`,
      config: {
        systemInstruction: systemInstructions,
        temperature: isGrandmaster ? 0.1 : 0.7,
      },
    });

    const text = (response.text || "").trim();
    // Use regex to pull out likely move notation from any accidental chat text
    const moveMatch = text.match(/[a-hNRBQKx1-8+#=O-]+/);
    return moveMatch ? moveMatch[0] : text;
  } catch (error: any) {
    console.error("Gemini Move Error:", error);
    throw error;
  }
};

export const getGeminiAdvice = async (fen: string): Promise<Advice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Chess position (FEN): ${fen}`,
      config: {
        systemInstruction: `You are a master chess coach. 
        Analyze the FEN. Identify the best move and provide a one-sentence strategic explanation. 
        The output must be JSON format.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: { 
              type: Type.STRING,
              description: "The recommended move in SAN format."
            },
            explanation: { 
              type: Type.STRING,
              description: "Brief tactical explanation of why this move is best."
            }
          },
          required: ["move", "explanation"]
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Advice Error:", error);
    throw error;
  }
};
