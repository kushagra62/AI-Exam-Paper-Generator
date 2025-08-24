
import { GoogleGenAI, Type } from "@google/genai";
import type { Exam, Question } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const examSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "The math question text.",
      },
      answer: {
        type: Type.STRING,
        description: "The correct answer to the math question.",
      },
    },
    required: ["question", "answer"],
  },
};

export const generateExam = async (topic: string, numQuestions: number): Promise<Exam> => {
  const prompt = `Generate an exam with ${numQuestions} math questions about "${topic}". The questions should be appropriate for a high school level. Provide a clear question and a concise answer for each.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: examSchema,
      },
    });

    const responseText = response.text.trim();
    const generatedExam: Exam = JSON.parse(responseText);

    if (!Array.isArray(generatedExam) || generatedExam.length === 0) {
      throw new Error("AI returned an invalid or empty exam format.");
    }
    
    // Sometimes the AI might ignore the count, so we slice it to be sure.
    return generatedExam.slice(0, numQuestions);

  } catch (error) {
    console.error("Error generating exam with Gemini:", error);
    throw new Error("Failed to generate the exam. The AI model might be unavailable or the request was malformed.");
  }
};