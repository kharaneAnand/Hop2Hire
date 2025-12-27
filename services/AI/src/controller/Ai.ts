import { Request, Response } from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";

dotenv.config();

if (!process.env.API_KEY_GEMINI) {
  throw new Error("❌ API_KEY_GEMINI is missing in environment variables");
}

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY_GEMINI,
});

export const careerGuide = TryCatch(
  async (req: Request, res: Response) => {
    const { skills } = req.body;

    if (!skills || typeof skills !== "string") {
      throw new ErrorHandler(400, "Skills are required and must be a string");
    }

    const prompt = `
You are a professional career advisor.

Based on the following skills:
"${skills}"

Generate career guidance STRICTLY in valid JSON.
Do not include markdown, comments, or extra text.

Return JSON in this exact structure:

{
  "summary": "Short encouraging summary",
  "jobOptions": [
    {
      "title": "Job role name",
      "responsibilities": "What the person does",
      "why": "Why this role fits the skills"
    }
  ],
  "skillsToLearn": [
    {
      "category": "Skill category",
      "skills": [
        {
          "title": "Skill name",
          "why": "Why it's important",
          "how": "How to learn it"
        }
      ]
    }
  ],
  "learningApproach": {
    "title": "How to Approach Learning",
    "points": [
      "Actionable learning advice"
    ]
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    if (!rawText) {
      throw new ErrorHandler(500, "AI returned empty response");
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
        rawResponse: rawText,
      });
    }

    return res.status(200).json({
      success: true,
      data: parsedResponse,
    });
  }
);


