
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Advice } from "../types";

export const getGeminiMove = async (fen: string, difficulty: Difficulty): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isGrandmaster = difficulty === Difficulty.GRANDMASTER;
  const model = isGrandmaster ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const systemInstructions = isGrandmaster 
    ? `You are a world-class Grandmaster chess engine. 
       Analyze the following board position in FEN format. 
       Determine the absolute best move. 
       Respond ONLY with the move in Standard Algebraic Notation (SAN), e.g., "e4", "Nf3", "O-O", "Bxe5+". 
       Do not include any other text or explanations.`
    : `You are a casual beginner chess player. 
       Analyze the following board position in FEN format. 
       Make a reasonable move. 
       Respond ONLY with the move in Standard Algebraic Notation (SAN).`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Current FEN: ${fen}`,
      config: {
        systemInstruction: systemInstructions,
        temperature: isGrandmaster ? 0.1 : 0.7,
        // Disable "thinking" for Beginner, and set a low budget for Grandmaster for speed
        thinkingConfig: { 
          thinkingBudget: isGrandmaster ? 1000 : 0 
        },
      },
    });

    const text = response.text || "";
    // Clean up response: Find the first string that looks like SAN
    // We look for patterns like e4, Nf3, O-O, Bxe5+, etc.
    const moveMatch = text.match(/([RNBQK]?[a-h]?[1-8]?x?[a-h][1-8](=[RNBQ])?[+#]?)|(O-O-O)|(O-O)/);
    const cleanMove = moveMatch ? moveMatch[0] : text.trim().split(/\s+/)[0];
    
    return cleanMove;
  } catch (error) {
    console.error("Gemini AI move error:", error);
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
        systemInstruction: `You are a professional chess coach. 
        Provide the best move in Standard Algebraic Notation (SAN) and a concise, one-sentence tactical explanation. 
        Your response MUST be in JSON format.`,
        thinkingConfig: { thinkingBudget: 0 }, // Advice should be instant
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: { type: Type.STRING, description: "The suggested move in SAN format" },
            explanation: { type: Type.STRING, description: "One sentence strategy" }
          },
          required: ["move", "explanation"]
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as Advice;
  } catch (error) {
    console.error("Gemini Advice error:", error);
    throw error;
  }
};
