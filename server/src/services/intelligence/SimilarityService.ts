export class SimilarityService {
  /**
   * Calculates the cosine similarity between two vectors.
   * Both vectors must have the same length.
   * Returns a value between -1.0 and 1.0.
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length for cosine similarity.');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculates the average similarity among a group of vectors.
   * This is used as the coherence score for a theme.
   * Returns a value between 0.0 and 1.0.
   */
  calculateCoherence(vectors: number[][]): number {
    if (vectors.length <= 1) return 1.0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        totalSimilarity += this.cosineSimilarity(vectors[i], vectors[j]);
        comparisons++;
      }
    }

    const avg = comparisons > 0 ? totalSimilarity / comparisons : 0;
    // Ensure we don't return negative coherence in edge cases
    return Math.max(0, avg);
  }
}

export const similarityService = new SimilarityService();
