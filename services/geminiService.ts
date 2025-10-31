import { GoogleGenAI } from "@google/genai";
import { Flight, GroundingSource } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const parseJsonResponse = (text: string): Flight[] | null => {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse JSON from model response:", e);
      return null;
    }
  }
  return null;
};

export const findFlights = async (query: string): Promise<{ flights: Flight[], sources: GroundingSource[] }> => {
  try {
    const prompt = `
      You are a world-class flight travel expert. Your task is to find flight routes based on the user's query.
      Use the Google Search tool to find the most relevant and up-to-date information.

      User Query: "${query}"

      Your response MUST be a JSON array of flight objects wrapped in a markdown JSON code block.
      Each object in the array should represent a unique flight option and must have the following structure:
      {
        "from": "Departure Airport Code (e.g., JFK)",
        "to": "Arrival Airport Code (e.g., LHR)",
        "airline": "Airline Name",
        "price": <numeric value in INR, without currency symbol>,
        "stops": <number of stops>,
        "duration": "Total travel time (e.g., '12h 30m')"
      }
      Do not include any text outside of the markdown JSON code block. Provide at least 5 options if possible.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const flightData = parseJsonResponse(response.text);
    if (!flightData) {
        throw new Error("Could not parse flight data from the AI's response.");
    }
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
        .map((chunk: any) => ({
            uri: chunk.web?.uri,
            title: chunk.web?.title,
        }))
        .filter((source: GroundingSource) => source.uri && source.title);

    return { flights: flightData, sources: [...new Map(sources.map(item => [item.uri, item])).values()] }; // a bit of deduplication
    
  } catch (error) {
    console.error("Error fetching flight data from Gemini API:", error);
    throw new Error("Failed to fetch flight information. Please try again.");
  }
};