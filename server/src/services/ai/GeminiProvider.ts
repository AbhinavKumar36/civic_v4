import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { env } from '../../config/env';
import { AIProvider } from './AIProvider';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');
  }

  async analyze(input: string): Promise<any> {
    throw new Error('Use generateStructuredOutput for Phase 1');
  }

  async embed(text: string): Promise<number[]> {
    throw new Error('Not implemented in Phase 1');
  }

  async generateStructuredOutput(prompt: string, schemaDefinition: any): Promise<any> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schemaDefinition,
      }
    });

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('[GeminiProvider] Error generating structured output:', error);
      throw new Error('AI Normalization failed');
    }
  }

  // Overload for multimodal (text + images)
  async generateMultimodalStructuredOutput(prompt: string, base64Images: { mimeType: string, data: string }[], schemaDefinition: any): Promise<any> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schemaDefinition,
      }
    });

    try {
      const parts: any[] = [{ text: prompt }];
      
      for (const img of base64Images) {
        parts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType
          }
        });
      }

      const result = await model.generateContent(parts);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('[GeminiProvider] Error generating multimodal output:', error);
      throw new Error('AI Multimodal Normalization failed');
    }
  }
}

export const geminiProvider = new GeminiProvider();
