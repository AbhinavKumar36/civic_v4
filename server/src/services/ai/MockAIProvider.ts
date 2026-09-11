import { AIProvider } from './AIProvider';

export class MockAIProvider implements AIProvider {
  async analyze(input: string): Promise<any> {
    return { status: 'mocked' };
  }

  async embed(text: string): Promise<number[]> {
    return [0.1, 0.2, 0.3];
  }

  async generateStructuredOutput(prompt: string, schemaDefinition: any): Promise<any> {
    return {
      category: "ROADS_AND_TRANSPORT",
      subCategory: "ROAD_CONDITION",
      title: "Mocked Road Issue",
      summary: "This is a mock summary.",
      demandStatement: "Fix the road.",
      problemStatement: "The road is broken.",
      affectedGroups: ["residents"],
      severity: "MEDIUM",
      urgency: "HIGH",
      entities: ["road"],
      language: "en",
      confidence: 0.95
    };
  }

  async generateMultimodalStructuredOutput(prompt: string, base64Images: any[], schemaDefinition: any): Promise<any> {
    return this.generateStructuredOutput(prompt, schemaDefinition);
  }
}
