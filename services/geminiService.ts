
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMovieAdvice = async (userPrompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful NYC cinema expert. Answer the following user request about movies or theaters in New York: "${userPrompt}". Keep it concise and enthusiastic. If recommending movies, mention their vibe.`,
      config: {
        systemInstruction: "You are CineNYC AI, a sophisticated movie concierge. You know everything about current cinema trends and NYC theaters.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a bit of trouble connecting to my movie database. Try asking again about showtimes in New York!";
  }
};

export const getSmartMovieFilters = async (query: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Identify the genre or mood from this search query: "${query}". Return a single word that best describes it.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tag: { type: Type.STRING }
                    },
                    required: ['tag']
                }
            }
        });
        const data = JSON.parse(response.text || '{"tag":""}');
        return data.tag;
    } catch (e) {
        return "";
    }
}
