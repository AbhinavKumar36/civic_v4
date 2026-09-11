import { pipeline, env } from '@xenova/transformers';

// Suppress local cache warnings for Xenova in node
env.allowLocalModels = false;

export class LocalEmbeddingProvider {
  private extractor: any = null;
  private modelName = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';

  private async getExtractor() {
    if (!this.extractor) {
      console.log(`[LocalEmbeddingProvider] Loading embedding model: ${this.modelName} ...`);
      this.extractor = await pipeline('feature-extraction', this.modelName);
      console.log(`[LocalEmbeddingProvider] Model loaded successfully.`);
    }
    return this.extractor;
  }

  async embed(text: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    // output.data is a Float32Array containing the embedding vector
    return Array.from(output.data);
  }

  getModelMetadata() {
    return {
      model: this.modelName,
      version: 'v2'
    };
  }
}

export const localEmbeddingProvider = new LocalEmbeddingProvider();
