import { similarityService } from '../services/intelligence/SimilarityService';
import { clusteringService } from '../services/intelligence/ClusteringService';
import { INormalizedDemand } from '../models/NormalizedDemand';
import { Types } from 'mongoose';

describe('Intelligence Services', () => {

  describe('SimilarityService', () => {
    it('should calculate cosine similarity correctly', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      expect(similarityService.cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);

      const vecC = [0, 1, 0];
      expect(similarityService.cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);

      const vecD = [1, 1, 0];
      expect(similarityService.cosineSimilarity(vecA, vecD)).toBeCloseTo(0.707, 3);
    });

    it('should calculate coherence correctly', () => {
      const vectors = [
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0]
      ];
      expect(similarityService.calculateCoherence(vectors)).toBeCloseTo(1.0);

      const mixed = [
        [1, 0, 0],
        [0, 1, 0]
      ];
      expect(similarityService.calculateCoherence(mixed)).toBeCloseTo(0.0);
    });
  });

  describe('ClusteringService', () => {
    const mockDemands: Partial<INormalizedDemand>[] = [
      {
        _id: new Types.ObjectId(),
        category: 'ROADS',
        title: 'Road is broken',
        embedding: { model: 'test', version: '1', vector: [1, 0, 0] }
      },
      {
        _id: new Types.ObjectId(),
        category: 'ROADS',
        title: 'Repair the road',
        embedding: { model: 'test', version: '1', vector: [0.9, 0.1, 0] }
      },
      {
        _id: new Types.ObjectId(),
        category: 'ROADS',
        title: 'Unrelated issue',
        embedding: { model: 'test', version: '1', vector: [0, 1, 0] }
      },
      {
        _id: new Types.ObjectId(),
        category: 'WATER', // Different category
        title: 'Water pipe leak',
        embedding: { model: 'test', version: '1', vector: [1, 0, 0] } // Semantically similar vector but different category
      }
    ];

    it('should group similar demands within the same category', () => {
      const clusters = clusteringService.clusterDemands(mockDemands as INormalizedDemand[]);
      
      // We expect 3 clusters:
      // 1. [Road is broken, Repair the road] (similarity > 0.75)
      // 2. [Unrelated issue] (isolated)
      // 3. [Water pipe leak] (different category)
      
      expect(clusters.length).toBe(3);
      
      const roadCluster = clusters.find(c => c.category === 'ROADS' && c.demands.length === 2);
      expect(roadCluster).toBeDefined();
      expect(roadCluster?.demands[0].title).toBe('Road is broken');
      
      const isolatedRoadCluster = clusters.find(c => c.category === 'ROADS' && c.demands.length === 1);
      expect(isolatedRoadCluster).toBeDefined();
      expect(isolatedRoadCluster?.demands[0].title).toBe('Unrelated issue');
      
      const waterCluster = clusters.find(c => c.category === 'WATER');
      expect(waterCluster).toBeDefined();
      expect(waterCluster?.demands.length).toBe(1);
    });
  });

});
