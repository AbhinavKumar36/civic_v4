import { Theme } from '../../models/Theme';
import { Cluster } from './ClusteringService';
import { geminiProvider } from '../ai/GeminiProvider';
import { CivicInput } from '../../models/CivicInput';
import { Types } from 'mongoose';

export class ThemeService {
  /**
   * Generates or updates Themes based on the clusters.
   * Prompts Gemini to summarize the theme without hallucinating.
   */
  async processClustersIntoThemes(clusters: Cluster[]) {
    const createdThemes = [];
    
    for (const cluster of clusters) {
      if (cluster.demands.length === 0) continue;

      // Calculate languages
      const languageDistribution: Record<string, number> = {};
      for (const d of cluster.demands) {
        languageDistribution[d.language] = (languageDistribution[d.language] || 0) + 1;
      }

      // Calculate unique citizens by looking up the original CivicInputs
      const civicInputIds = cluster.demands.map(d => d.civicInputId);
      const originalInputs = await CivicInput.find({ _id: { $in: civicInputIds } });
      const uniqueCitizens = new Set(originalInputs.map(input => input.citizenId.toString()));
      const uniqueCitizenCount = uniqueCitizens.size;

      // Temporal bounds
      const sortedByDate = [...cluster.demands].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const firstObservedAt = sortedByDate[0].createdAt;
      const lastObservedAt = sortedByDate[sortedByDate.length - 1].createdAt;

      // Determine recurrence status
      let recurrenceStatus: 'ISOLATED' | 'EMERGING' | 'RECURRING' = 'ISOLATED';
      if (uniqueCitizenCount >= 3) {
        recurrenceStatus = 'RECURRING';
      } else if (uniqueCitizenCount === 2) {
        recurrenceStatus = 'EMERGING';
      }

      // Generate a human-readable name and summary using AI
      const sampleTexts = cluster.demands.slice(0, 5).map(d => d.demandStatement);
      const aiSummary = await this.generateThemeNameAndSummary(cluster.category, sampleTexts);

      // Create Theme
      const theme = new Theme({
        name: aiSummary.themeName,
        summary: aiSummary.summary,
        category: cluster.category,
        representativeDemandId: cluster.demands[0]._id, // Using first as representative for now
        demandCount: cluster.demands.length,
        uniqueCitizenCount,
        languageDistribution,
        recurrenceStatus,
        coherenceScore: cluster.coherenceScore,
        geographicSpread: 0, // Calculated later in HotspotService if needed
        firstObservedAt,
        lastObservedAt
      });

      await theme.save();
      
      // Update all demands in this cluster to reference this new theme
      for (const d of cluster.demands) {
        d.themeId = theme._id as Types.ObjectId;
        await d.save();
      }

      createdThemes.push({ theme, demands: cluster.demands });
    }

    return createdThemes;
  }

  private async generateThemeNameAndSummary(category: string, demandStatements: string[]) {
    const prompt = `
      You are an AI tasked with naming and summarizing a cluster of civic demands.
      Category: ${category}
      Sample Demands:
      ${demandStatements.map(d => `- ${d}`).join('\n')}

      Rules:
      1. Create a concise, professional themeName (e.g., "Poor Road Access").
      2. Create a 1-sentence summary of what the citizens are collectively asking for.
      3. DO NOT invent statistics, locations, or demographic data. ONLY summarize the provided text.
    `;

    const schema = {
      type: "object",
      properties: {
        themeName: { type: "string" },
        summary: { type: "string" }
      },
      required: ["themeName", "summary"]
    };

    return await geminiProvider.generateStructuredOutput(prompt, schema);
  }
}

export const themeService = new ThemeService();
