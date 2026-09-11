export interface AIProvider {
  analyze(input: string): Promise<any>;
  generateStructuredOutput(input: string, schema: any): Promise<any>;
  embed(text: string): Promise<number[]>;
}

export class PlaceholderAIProvider implements AIProvider {
  async analyze(input: string): Promise<any> {
    throw new Error('Not implemented in Phase 0');
  }
  
  async generateStructuredOutput(input: string, schema: any): Promise<any> {
    throw new Error('Not implemented in Phase 0');
  }
  
  async embed(text: string): Promise<number[]> {
    throw new Error('Not implemented in Phase 0');
  }
}
