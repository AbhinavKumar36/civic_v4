import { CivicInput, ICivicInput } from '../models/CivicInput';
import { NormalizedDemand } from '../models/NormalizedDemand';
import { env } from '../config/env';
import { GeminiProvider } from './ai/GeminiProvider';
import { MockAIProvider } from './ai/MockAIProvider';
import { SchemaType } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const aiProvider = env.NODE_ENV === 'test' ? new MockAIProvider() : new GeminiProvider();

const NORMALIZATION_PROMPT = `
You are a civic-development demand normalization engine.
Your task is to faithfully convert citizen input into structured civic information.
Requirements:
1. Preserve the citizen's intent. Do not invent facts.
2. Identify the primary civic-development category from: ROADS_AND_TRANSPORT, WATER_AND_SANITATION, ELECTRICITY, HEALTHCARE, EDUCATION, PUBLIC_SAFETY, HOUSING, DRAINAGE_AND_FLOODING, WASTE_MANAGEMENT, ENVIRONMENT, AGRICULTURE, EMPLOYMENT_AND_LIVELIHOODS, DIGITAL_CONNECTIVITY, PUBLIC_SPACES, SOCIAL_WELFARE, OTHER.
3. Produce a concise summary.
4. Express the underlying development demand and problem statement.
5. Identify affected groups only when reasonably inferable.
6. Estimate severity and urgency separately (LOW, MEDIUM, HIGH, CRITICAL).
7. Preserve the original language of the user input if possible, but the JSON keys must be English.
8. Return a confidence score between 0.0 and 1.0 reflecting your confidence in interpreting the input.
9. If information is ambiguous, lower confidence.
10. Never fabricate locations, statistics, or infrastructure conditions.
`;

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: { type: SchemaType.STRING },
    subCategory: { type: SchemaType.STRING },
    title: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING },
    demandStatement: { type: SchemaType.STRING },
    problemStatement: { type: SchemaType.STRING },
    affectedGroups: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    severity: { type: SchemaType.STRING },
    urgency: { type: SchemaType.STRING },
    entities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    language: { type: SchemaType.STRING },
    confidence: { type: SchemaType.NUMBER },
  },
  required: ["category", "title", "summary", "demandStatement", "severity", "urgency", "language", "confidence"]
};

export class NormalizationService {
  async process(civicInput: ICivicInput): Promise<void> {
    try {
      civicInput.status = 'PROCESSING';
      await civicInput.save();

      const basePrompt = NORMALIZATION_PROMPT + `\n\nCitizen Input Text: ${civicInput.text || 'None'}`;
      
      let aiResult;

      if (civicInput.inputType === 'MULTIMODAL' || civicInput.inputType === 'IMAGE') {
        // Prepare images for Gemini
        const imagesContext = [];
        if (civicInput.media && civicInput.media.length > 0) {
          for (const mediaUrl of civicInput.media) {
            const filename = path.basename(mediaUrl);
            const localPath = path.join(__dirname, '../../../uploads', filename);
            if (fs.existsSync(localPath)) {
              const fileData = fs.readFileSync(localPath);
              const base64Data = fileData.toString('base64');
              const ext = path.extname(filename).toLowerCase();
              let mimeType = 'image/jpeg';
              if (ext === '.png') mimeType = 'image/png';
              if (ext === '.webp') mimeType = 'image/webp';
              
              imagesContext.push({
                mimeType,
                data: base64Data
              });
            }
          }
        }

        if (aiProvider instanceof GeminiProvider && imagesContext.length > 0) {
          aiResult = await aiProvider.generateMultimodalStructuredOutput(basePrompt, imagesContext, responseSchema);
        } else {
           // Fallback to text if no images found or mocked
           aiResult = await aiProvider.generateStructuredOutput(basePrompt, responseSchema);
        }
      } else {
        // TEXT or VOICE (transcript)
        aiResult = await aiProvider.generateStructuredOutput(basePrompt, responseSchema);
      }

      // Basic validation of AI Output (could use Zod here)
      if (!aiResult.category || !aiResult.title) {
        throw new Error('AI produced malformed output missing required fields.');
      }

      const normalizedDemand = new NormalizedDemand({
        civicInputId: civicInput._id,
        category: aiResult.category,
        subCategory: aiResult.subCategory,
        title: aiResult.title,
        summary: aiResult.summary,
        demandStatement: aiResult.demandStatement,
        problemStatement: aiResult.problemStatement,
        affectedGroups: aiResult.affectedGroups || [],
        severity: aiResult.severity || 'MEDIUM',
        urgency: aiResult.urgency || 'MEDIUM',
        language: aiResult.language || civicInput.originalLanguage || 'en',
        entities: aiResult.entities || [],
        confidence: aiResult.confidence || 0.5,
        location: civicInput.location, // Carry over the location from CivicInput
        aiProvider: env.NODE_ENV === 'test' ? 'MockAI' : 'Gemini-2.5-pro',
        aiModel: 'gemini-2.5-pro',
        processingStatus: 'COMPLETED'
      });

      await normalizedDemand.save();

      civicInput.status = 'NORMALIZED';
      civicInput.normalizedDemandId = normalizedDemand._id as any;
      await civicInput.save();

    } catch (error) {
      console.error(`[NormalizationService] Failed to process CivicInput ${civicInput._id}:`, error);
      civicInput.status = 'FAILED';
      await civicInput.save();
    }
  }
}

export const normalizationService = new NormalizationService();
