
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface NewsArticle {
  title: string;
  category: string;
  snippet: string;
  source: string;
}

export const fetchLiveNews = async (): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Provide 5 short, current global news headlines (max 40 chars each). Just the text, one per line.',
      config: {
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    });
    return response.text?.split('\n').filter(line => line.trim().length > 0) || [];
  } catch (error) {
    console.error("Error fetching news headlines:", error);
    return ["Tech stocks rallying", "Climate summit begins", "New space mission launched"];
  }
};

export const fetchFullNewsFeed = async (): Promise<NewsArticle[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Generate a list of 6 trending global news articles. Include a category, title, a short 1-sentence snippet, and a fake source name.',
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              snippet: { type: Type.STRING },
              source: { type: Type.STRING }
            },
            required: ["title", "category", "snippet", "source"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error fetching full news feed:", error);
    return [
      { category: "Tech", title: "Future of AI", snippet: "AI continues to transform the mobile landscape.", source: "TechDaily" },
      { category: "World", title: "New Trade Routes", snippet: "New oceanic paths are being explored for efficiency.", source: "GlobalNews" }
    ];
  }
};

export const performWebSearch = async (query: string): Promise<{ text: string, links: { title: string, uri: string }[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search the web for: ${query}. Provide a concise summary and list the main sources.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || ''
      })) || [];

    return {
      text: response.text || '',
      links: links
    };
  } catch (error) {
    console.error("Search error:", error);
    return { text: "Search failed. Please try again.", links: [] };
  }
};

export const fetchSiteSummary = async (url: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a 3-word status or summary for the website: ${url}`,
    });
    return response.text?.trim() || "Live Updates Available";
  } catch (error) {
    return "Check updates";
  }
};
