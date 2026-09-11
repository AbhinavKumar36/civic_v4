import { DevelopmentProposal, IDevelopmentProposal } from '../../models/DevelopmentProposal';
import { NormalizedDemand, INormalizedDemand } from '../../models/NormalizedDemand';
import { Theme, ITheme } from '../../models/Theme';
import { DemandHotspot, IDemandHotspot } from '../../models/DemandHotspot';
import { EvidenceRecord, IEvidenceRecord } from '../../models/EvidenceRecord';
import { DataRecord } from '../../models/DataRecord';
import { geoContextService } from '../data/GeoContextService';
import { Types } from 'mongoose';

export interface MatchedProposalContext {
  demands: INormalizedDemand[];
  themes: ITheme[];
  hotspots: IDemandHotspot[];
  evidenceRecords: IEvidenceRecord[];
  nearbyContextRecords: any[];
  uniqueCitizensCount: number;
  totalSubmissionsCount: number;
  wardDemographics?: {
    population?: number;
    slumPopulation?: number;
    childrenPopulation?: number;
    elderlyPopulation?: number;
  };
}

export class ProposalMatchingService {
  /**
   * Matches a DevelopmentProposal to relevant demands, themes, hotspots, and contextual data.
   */
  async matchContextForProposal(proposal: IDevelopmentProposal): Promise<MatchedProposalContext> {
    const category = proposal.category;
    const coords = proposal.location?.coordinates; // [lon, lat]
    const searchRadiusMeters = 5000; // 5km

    // 1. Find demands matching category and/or location
    let demandQuery: any = { category };
    
    // If explicitly linked, use those IDs
    if (proposal.relatedDemandIds && proposal.relatedDemandIds.length > 0) {
      demandQuery = { _id: { $in: proposal.relatedDemandIds } };
    } else if (coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      // Find within radius and category
      demandQuery = {
        category,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: coords },
            $maxDistance: searchRadiusMeters
          }
        }
      };
    }

    let demands: INormalizedDemand[] = [];
    try {
      demands = await NormalizedDemand.find(demandQuery).limit(50);
    } catch (err) {
      // Fallback without $near if index or query fails
      demands = await NormalizedDemand.find({ category }).limit(50);
    }

    // If still 0 demands found, look for all demands in the same category across the city
    if (demands.length === 0) {
      demands = await NormalizedDemand.find({ category }).limit(20);
    }

    // 2. Extract unique citizens and submissions
    const citizenIdSet = new Set<string>();
    for (const d of demands) {
      if (d.civicInputId) {
        citizenIdSet.add(d.civicInputId.toString());
      }
    }
    const totalSubmissionsCount = demands.length;
    const uniqueCitizensCount = citizenIdSet.size > 0 ? citizenIdSet.size : demands.length;

    // 3. Find related themes
    const themeIds = demands
      .map(d => d.themeId)
      .filter((id): id is Types.ObjectId => Boolean(id));

    let themes: ITheme[] = [];
    if (proposal.relatedThemeIds && proposal.relatedThemeIds.length > 0) {
      themes = await Theme.find({ _id: { $in: proposal.relatedThemeIds } });
    } else if (themeIds.length > 0) {
      themes = await Theme.find({ _id: { $in: themeIds } });
    } else {
      themes = await Theme.find({ category }).limit(5);
    }

    // 4. Find related hotspots
    const allThemeIds = themes.map(t => t._id);
    let hotspots: IDemandHotspot[] = [];
    if (proposal.relatedHotspotIds && proposal.relatedHotspotIds.length > 0) {
      hotspots = await DemandHotspot.find({ _id: { $in: proposal.relatedHotspotIds } });
    } else if (allThemeIds.length > 0) {
      hotspots = await DemandHotspot.find({ themeId: { $in: allThemeIds } });
    }

    // 5. Find contextual evidence records
    const demandIds = demands.map(d => d._id);
    const hotspotIds = hotspots.map(h => h._id);

    const evidenceRecords = await EvidenceRecord.find({
      $or: [
        { demandId: { $in: demandIds } },
        { hotspotId: { $in: hotspotIds } }
      ]
    }).populate('datasetId');

    // 6. Find nearby contextual records (amenities, roads, demographic data)
    let nearbyContextRecords: any[] = [];
    let wardDemographics: any = undefined;

    if (coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      try {
        nearbyContextRecords = await geoContextService.findNearbyRecords(coords[0], coords[1], searchRadiusMeters);
      } catch (e) {
        nearbyContextRecords = [];
      }
    }

    // Check if we have demographic records for the ward
    if (proposal.wardId) {
      const wardRecord = await DataRecord.findOne({
        name: { $regex: new RegExp(proposal.wardId, 'i') }
      });
      if (wardRecord && wardRecord.attributes) {
        wardDemographics = {
          population: wardRecord.attributes.population || wardRecord.attributes.total_population,
          slumPopulation: wardRecord.attributes.slum_population,
          childrenPopulation: wardRecord.attributes.children_0_6,
          elderlyPopulation: wardRecord.attributes.elderly_population
        };
      }
    }

    return {
      demands,
      themes,
      hotspots,
      evidenceRecords,
      nearbyContextRecords,
      uniqueCitizensCount,
      totalSubmissionsCount,
      wardDemographics
    };
  }
}

export const proposalMatchingService = new ProposalMatchingService();
