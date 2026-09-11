import { NormalizedDemand } from '../../models/NormalizedDemand';
import { Theme } from '../../models/Theme';
import { DemandHotspot } from '../../models/DemandHotspot';
import { localEmbeddingProvider } from '../ai/LocalEmbeddingProvider';
import { clusteringService } from './ClusteringService';
import { themeService } from './ThemeService';
import { hotspotService } from './HotspotService';

export class IntelligencePipeline {
  /**
   * Orchestrates the Phase 2 Collective Demand Intelligence pipeline.
   * 1. Embeds unprocessed normalized demands
   * 2. Clears old themes/hotspots (simple batch process for Phase 2)
   * 3. Clusters demands
   * 4. Generates Themes
   * 5. Detects Hotspots
   */
  async runPipeline() {
    console.log('[IntelligencePipeline] Starting Phase 2 Processing...');

    // 1. Generate Embeddings for any demand missing them
    const demandsWithoutEmbeddings = await NormalizedDemand.find({ embedding: { $exists: false } });
    console.log(`[IntelligencePipeline] Found ${demandsWithoutEmbeddings.length} demands missing embeddings. Generating...`);
    
    for (const demand of demandsWithoutEmbeddings) {
      try {
        const vector = await localEmbeddingProvider.embed(demand.demandStatement);
        const meta = localEmbeddingProvider.getModelMetadata();
        
        demand.embedding = {
          model: meta.model,
          version: meta.version,
          vector
        };
        await demand.save();
      } catch (err) {
        console.error(`[IntelligencePipeline] Failed to embed demand ${demand._id}`, err);
      }
    }

    // 2. Clear old intelligence data (since we are doing a full recalculation for simplicity in Phase 2)
    console.log('[IntelligencePipeline] Clearing previous Themes and Hotspots...');
    await Theme.deleteMany({});
    await DemandHotspot.deleteMany({});

    // 3. Fetch all embedded demands
    const allDemands = await NormalizedDemand.find({ embedding: { $exists: true } });
    if (allDemands.length === 0) {
      console.log('[IntelligencePipeline] No embedded demands to process. Pipeline complete.');
      return;
    }

    // 4. Cluster Demands
    console.log('[IntelligencePipeline] Clustering demands...');
    const clusters = clusteringService.clusterDemands(allDemands);
    console.log(`[IntelligencePipeline] Generated ${clusters.length} semantic clusters.`);

    // 5. Generate Themes
    console.log('[IntelligencePipeline] Generating Themes...');
    const themesWithDemands = await themeService.processClustersIntoThemes(clusters);
    console.log(`[IntelligencePipeline] Saved ${themesWithDemands.length} Themes.`);

    // 6. Detect Hotspots
    console.log('[IntelligencePipeline] Detecting Geographic Hotspots...');
    for (const { theme, demands } of themesWithDemands) {
      await hotspotService.processThemeHotspots(theme, demands);
    }
    const hotspotCount = await DemandHotspot.countDocuments();
    console.log(`[IntelligencePipeline] Detected ${hotspotCount} Demand Hotspots.`);

    console.log('[IntelligencePipeline] Phase 2 Processing Complete!');
    return {
      processedDemands: allDemands.length,
      themesGenerated: themesWithDemands.length,
      hotspotsDetected: hotspotCount
    };
  }
}

export const intelligencePipeline = new IntelligencePipeline();
