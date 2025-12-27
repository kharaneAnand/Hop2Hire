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

export const resumeAnalyzer = TryCatch(
  async (req: Request, res: Response) => {
    const { pdfBase64 } = req.body;

    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      throw new ErrorHandler(400, "PDF base64 data is required");
    }

    if (!pdfBase64.startsWith("data:application/pdf")) {
      throw new ErrorHandler(400, "Invalid PDF format");
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer.

Analyze the resume and return STRICTLY valid JSON.
Do NOT include markdown or extra text.

Return JSON in this exact structure:

{
  "atsScore": 85,
  "scoreBreakdown": {
    "formatting": {
      "score": 90,
      "feedback": "Brief feedback"
    },
    "keywords": {
      "score": 80,
      "feedback": "Brief feedback"
    },
    "structure": {
      "score": 85,
      "feedback": "Brief feedback"
    },
    "readability": {
      "score": 88,
      "feedback": "Brief feedback"
    }
  },
  "suggestions": [
    {
      "category": "Formatting | Content | Keywords | Structure",
      "issue": "Issue found",
      "recommendation": "Actionable fix",
      "priority": "high | medium | low"
    }
  ],
  "strengths": [
    "Strength point"
  ],
  "summary": "2–3 sentence ATS summary"
}

Focus on:
- ATS compatibility
- Standard section headings
- Keyword optimization
- Formatting issues
- Quantifiable achievements
- Readability and structure
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(
                  /^data:application\/pdf;base64,/,
                  ""
                ),
              },
            },
          ],
        },
      ],
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
      throw new ErrorHandler(500, "AI returned invalid JSON");
    }

    return res.status(200).json({
      success: true,
      data: parsedResponse,
    });
  }
);

