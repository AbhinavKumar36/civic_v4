import { DemandHotspot } from '../../models/DemandHotspot';
import { INormalizedDemand } from '../../models/NormalizedDemand';
import { ITheme } from '../../models/Theme';
import { CivicInput } from '../../models/CivicInput';

export class HotspotService {
  // Approximate conversion: 1 degree latitude ~ 111km. 
  // We'll use a very simple distance calculation for Phase 2.
  private HOTSPOT_RADIUS_DEGREES = 0.05; // Roughly 5km

  /**
   * Groups demands by geographic proximity within a specific theme.
   */
  async processThemeHotspots(theme: ITheme, demands: INormalizedDemand[]) {
    // Only consider demands that have a location
    const locatedDemands = demands.filter(d => d.location && d.location.coordinates && d.location.coordinates.length === 2);
    if (locatedDemands.length === 0) return;

    const visited = new Set<string>();

    for (let i = 0; i < locatedDemands.length; i++) {
      const currentDemand = locatedDemands[i];
      if (visited.has(currentDemand._id.toString())) continue;

      const cluster = [currentDemand];
      visited.add(currentDemand._id.toString());

      const [lon1, lat1] = currentDemand.location!.coordinates;

      for (let j = i + 1; j < locatedDemands.length; j++) {
        const targetDemand = locatedDemands[j];
        if (visited.has(targetDemand._id.toString())) continue;

        const [lon2, lat2] = targetDemand.location!.coordinates;
        
        // Simple euclidean distance on lat/lon (sufficient for small scale hackathon)
        const dist = Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));

        if (dist <= this.HOTSPOT_RADIUS_DEGREES) {
          cluster.push(targetDemand);
          visited.add(targetDemand._id.toString());
        }
      }

      // For demo purposes, we will allow even a single demand to create a hotspot
      if (cluster.length >= 1) {
        // Calculate center (mean of coordinates)
        const avgLon = cluster.reduce((sum, d) => sum + d.location!.coordinates[0], 0) / cluster.length;
        const avgLat = cluster.reduce((sum, d) => sum + d.location!.coordinates[1], 0) / cluster.length;

        // Calculate unique citizens
        const civicInputIds = cluster.map(d => d.civicInputId);
        const originalInputs = await CivicInput.find({ _id: { $in: civicInputIds } });
        const uniqueCitizenCount = new Set(originalInputs.map(input => input.citizenId.toString())).size;

        // Temporal
        const sortedByDate = [...cluster].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        // Intensity calculation (f(demandCount, uniqueCitizens))
        const intensity = (cluster.length * 0.5) + (uniqueCitizenCount * 0.5);

        // Radius calculation: start at 100m, grow slightly with more demands but cap at 500m
        const displayRadius = cluster.length === 1 ? 100 : Math.min(500, 50 + (cluster.length * 50));

        const hotspot = new DemandHotspot({
          themeId: theme._id,
          center: {
            type: 'Point',
            coordinates: [avgLon, avgLat]
          },
          radius: displayRadius,
          demandCount: cluster.length,
          uniqueCitizenCount,
          coherenceScore: theme.coherenceScore, // inherit theme coherence
          intensity,
          firstObservedAt: sortedByDate[0].createdAt,
          lastObservedAt: sortedByDate[sortedByDate.length - 1].createdAt
        });

        await hotspot.save();

        // Update Theme geographicSpread
        theme.geographicSpread += 1;
        await theme.save();
      }
    }
  }
}

export const hotspotService = new HotspotService();
