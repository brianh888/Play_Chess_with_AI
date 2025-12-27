
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Advice } from "../types";

export const getGeminiMove = async (fen: string, difficulty: Difficulty): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstructions = difficulty === Difficulty.GRANDMASTER 
    ? `You are a world-class Grandmaster chess engine. 
       Analyze the following board position in FEN format. 
       Determine the absolute best move. 
       Respond only with the move in Standard Algebraic Notation (SAN), e.g., "e4", "Nf3", "O-O".`
    : `You are a beginner chess player. 
       Analyze the following board position in FEN format. 
       Make a reasonable move, but it doesn't have to be perfect. Sometimes make slight positional errors.
       Respond only with the move in Standard Algebraic Notation (SAN).`;

  try {
    const response = await ai.models.generateContent({
      model: difficulty === Difficulty.GRANDMASTER ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
      contents: `Position: ${fen}`,
      config: {
        systemInstruction: systemInstructions,
        temperature: difficulty === Difficulty.GRANDMASTER ? 0.1 : 0.8,
        responseMimeType: "text/plain",
      },
    });

    const move = response.text?.trim() || "";
    const cleanMove = move.split(/\s+/)[0].replace(/[^a-zA-Z0-9+#=]/g, '');
    return cleanMove;
  } catch (error) {
    console.error("Gemini AI error:", error);
    throw error;
  }
};

export const getGeminiAdvice = async (fen: string): Promise<Advice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this chess position (FEN): ${fen}. Suggest the best move for the current player.`,
      config: {
        systemInstruction: `You are a professional chess coach. 
        Provide the best move in Standard Algebraic Notation (SAN) and a concise, one-sentence tactical explanation of why it is the best move. 
        Your response MUST be in JSON format.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: { type: Type.STRING, description: "The suggested move in SAN format (e.g. 'Nf3', 'e4')" },
            explanation: { type: Type.STRING, description: "A concise explanation of the move's strategy" }
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
