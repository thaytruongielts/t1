import { GoogleGenAI, Type } from "@google/genai";
import type { Evaluation } from '../types';

export async function getIeltsFeedback(
  chartDescription: string, 
  userAnswer: string
): Promise<Evaluation> {
  // This check is for the development environment and will be tree-shaken in production.
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using mocked data.");
    // Return a mock response if API key is not available
    return new Promise(resolve => setTimeout(() => resolve({
      bandScore: 6.5,
      strengths: ["Good attempt at paraphrasing 'shows' with 'illustrates'.", "Correctly identified the key elements of the chart (transport modes, years)."],
      improvements: ["Avoid starting with 'The provided...'. Be more direct.", "Try to combine the two years into one phrase, for example, 'between 1990 and 2020' or 'in two separate years'." ],
      highBandAnswer: "The bar chart compares the primary methods of transport used by commuters in the UK to travel to their workplaces in 1990 and 2020."
    }), 1500));
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    IELTS Writing Task 1 Chart Description: "${chartDescription}"
    Student's Introduction: "${userAnswer}"

    Based on the chart description and the student's introduction, provide a detailed evaluation. The student wants to score Band 7.0 or higher.
  `;

  const responseSchema = {
      type: Type.OBJECT,
      properties: {
        bandScore: {
          type: Type.NUMBER,
          description: "An estimated IELTS band score for the introduction, from 1.0 to 9.0, in 0.5 increments."
        },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of 2-3 specific strengths of the student's writing."
        },
        improvements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of 2-3 specific, actionable areas for improvement to reach Band 7.0."
        },
        highBandAnswer: {
          type: Type.STRING,
          description: "A model introduction that would be considered a high-band (7.0+) answer."
        }
      },
      required: ["bandScore", "strengths", "improvements", "highBandAnswer"]
    };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are an expert IELTS examiner specializing in Writing Task 1. Your task is to evaluate a student's paraphrased introduction for a given chart and provide structured feedback to help them improve. Be concise, constructive, and encouraging.",
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as Evaluation;
  } catch (e) {
    console.error("Failed to parse Gemini response:", jsonText);
    throw new Error("There was an issue receiving feedback from the AI.");
  }
}