import { INormalizedDemand } from '../../models/NormalizedDemand';
import { similarityService } from './SimilarityService';

export interface Cluster {
  category: string;
  demands: INormalizedDemand[];
  coherenceScore: number;
}

export class ClusteringService {
  private SIMILARITY_THRESHOLD = 0.75; // Configurable threshold

  /**
   * Groups demands into semantic clusters within their same category.
   * Uses a simple agglomerative distance-based approach for Phase 2 scale.
   */
  clusterDemands(demands: INormalizedDemand[]): Cluster[] {
    const clusters: Cluster[] = [];

    // Filter out demands that haven't been embedded
    const embeddedDemands = demands.filter(d => d.embedding && d.embedding.vector);

    // Group first by category (do NOT cluster different categories together as per strict rules)
    const categoryGroups = embeddedDemands.reduce((acc, demand) => {
      const cat = demand.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(demand);
      return acc;
    }, {} as Record<string, INormalizedDemand[]>);

    for (const category in categoryGroups) {
      const categoryDemands = categoryGroups[category];
      const visited = new Set<string>();

      for (let i = 0; i < categoryDemands.length; i++) {
        const currentDemand = categoryDemands[i];
        if (visited.has(currentDemand._id.toString())) continue;

        const currentCluster = [currentDemand];
        visited.add(currentDemand._id.toString());
        const currentVec = currentDemand.embedding!.vector;

        for (let j = i + 1; j < categoryDemands.length; j++) {
          const targetDemand = categoryDemands[j];
          if (visited.has(targetDemand._id.toString())) continue;

          const targetVec = targetDemand.embedding!.vector;
          const sim = similarityService.cosineSimilarity(currentVec, targetVec);

          if (sim >= this.SIMILARITY_THRESHOLD) {
            currentCluster.push(targetDemand);
            visited.add(targetDemand._id.toString());
          }
        }

        // Calculate coherence for this specific cluster
        const vectors = currentCluster.map(d => d.embedding!.vector);
        const coherenceScore = similarityService.calculateCoherence(vectors);

        clusters.push({
          category,
          demands: currentCluster,
          coherenceScore
        });
      }
    }

    return clusters;
  }
}

export const clusteringService = new ClusteringService();
