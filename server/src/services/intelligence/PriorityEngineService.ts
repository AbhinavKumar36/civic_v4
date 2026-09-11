import { DevelopmentProposal, IDevelopmentProposal } from '../../models/DevelopmentProposal';
import { PriorityAssessment, IPriorityAssessment, IPriorityFactor } from '../../models/PriorityAssessment';
import { proposalMatchingService, MatchedProposalContext } from './ProposalMatchingService';
import { Types } from 'mongoose';

export type PriorityWeights = Record<string, number>;

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  demandStrength: 0.15,
  uniqueCitizenReach: 0.15,
  recurrence: 0.10,
  geographicConcentration: 0.10,
  contextualEvidence: 0.15,
  infrastructureGap: 0.10,
  urgency: 0.05,
  severity: 0.05,
  affectedPopulation: 0.05,
  equityVulnerability: 0.05,
  evidenceConfidence: 0.05
};

export class PriorityEngineService {
  /**
   * Evaluates a single proposal deterministically.
   */
  async evaluateProposal(
    proposalId: string, 
    customWeights: Partial<PriorityWeights> = {}
  ): Promise<IPriorityAssessment> {
    const proposal = await DevelopmentProposal.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    const weights: Record<string, number> = Object.assign({}, DEFAULT_PRIORITY_WEIGHTS, customWeights);

    // 1. Gather context (demands, themes, hotspots, evidence, datasets)
    const context = await proposalMatchingService.matchContextForProposal(proposal);

    // 2. Compute each factor deterministically (0 - 100)
    const demandStrength = this.calcDemandStrength(context, weights.demandStrength);
    const uniqueCitizenReach = this.calcUniqueCitizenReach(context, weights.uniqueCitizenReach);
    const recurrence = this.calcRecurrence(context, weights.recurrence);
    const geographicConcentration = this.calcGeographicConcentration(context, weights.geographicConcentration);
    const contextualEvidence = this.calcContextualEvidence(context, weights.contextualEvidence);
    const infrastructureGap = this.calcInfrastructureGap(proposal, context, weights.infrastructureGap);
    const urgency = this.calcUrgency(context, weights.urgency);
    const severity = this.calcSeverity(context, weights.severity);
    const affectedPopulation = this.calcAffectedPopulation(proposal, context, weights.affectedPopulation);
    const equityVulnerability = this.calcEquityVulnerability(proposal, context, weights.equityVulnerability);
    const evidenceConfidence = this.calcEvidenceConfidence(context, weights.evidenceConfidence);

    const factors = {
      demandStrength,
      uniqueCitizenReach,
      recurrence,
      geographicConcentration,
      contextualEvidence,
      infrastructureGap,
      urgency,
      severity,
      affectedPopulation,
      equityVulnerability,
      evidenceConfidence
    };

    // 3. Compute total score as weighted sum
    const totalScoreRaw = Object.values(factors).reduce((sum, factor) => sum + factor.contribution, 0);
    const totalScore = Math.min(100, Math.max(0, Math.round(totalScoreRaw * 10) / 10));

    // 4. Generate structured explanation (top strengths, limitations)
    const factorList = Object.entries(factors).map(([key, f]) => ({ key, ...f }));
    factorList.sort((a, b) => b.contribution - a.contribution);

    const topStrengths = factorList.slice(0, 3).map(
      f => `${f.label} contributed +${f.contribution.toFixed(1)} pts (${f.normalizedValue}/100 normalized - ${f.explanation || f.rawValue})`
    );

    const limitationsList = factorList.filter(f => f.normalizedValue < 50);
    const limitations = limitationsList.length > 0 
      ? limitationsList.map(f => `${f.label} limited score to ${f.normalizedValue}/100 (${f.explanation || f.rawValue})`)
      : ['No major limiting factors identified; proposal has balanced cross-dimensional indicators.'];

    const summary = `Proposal evaluated with overall score ${totalScore}/100 based on ${context.totalSubmissionsCount} submissions across ${context.uniqueCitizensCount} citizens and ${context.evidenceRecords.length} contextual evidence records.`;

    // 5. Save or update PriorityAssessment
    const demandIds = context.demands.map(d => d._id as Types.ObjectId);
    const themeIds = context.themes.map(t => t._id as Types.ObjectId);
    const hotspotIds = context.hotspots.map(h => h._id as Types.ObjectId);
    const evidenceIds = context.evidenceRecords.map(e => e._id as Types.ObjectId);

    let assessment = await PriorityAssessment.findOne({ proposalId: proposal._id });
    if (assessment) {
      assessment.demandIds = demandIds;
      assessment.themeIds = themeIds;
      assessment.hotspotIds = hotspotIds;
      assessment.evidenceIds = evidenceIds;
      assessment.factors = factors;
      assessment.weights = weights;
      assessment.totalScore = totalScore;
      assessment.explanation = { summary, topStrengths, limitations };
      assessment.calculatedAt = new Date();
      await assessment.save();
    } else {
      assessment = await PriorityAssessment.create({
        proposalId: proposal._id,
        demandIds,
        themeIds,
        hotspotIds,
        evidenceIds,
        factors,
        weights,
        totalScore,
        explanation: { summary, topStrengths, limitations },
        calculatedAt: new Date()
      });
    }

    // 6. Update cached score and links on proposal
    proposal.relatedDemandIds = demandIds;
    proposal.relatedThemeIds = themeIds;
    proposal.relatedHotspotIds = hotspotIds;
    proposal.priorityScore = totalScore;
    proposal.status = 'EVALUATED';
    await proposal.save();

    return assessment;
  }

  /**
   * Recalculates priority rankings across all proposals.
   */
  async recalculateRankings(): Promise<IPriorityAssessment[]> {
    const assessments = await PriorityAssessment.find().sort({ totalScore: -1 });
    
    for (let i = 0; i < assessments.length; i++) {
      const rank = i + 1;
      assessments[i].rank = rank;
      await assessments[i].save();

      // Update rank on proposal
      await DevelopmentProposal.findByIdAndUpdate(assessments[i].proposalId, {
        priorityRank: rank
      });
    }

    return assessments;
  }

  // --- DETERMINISTIC FACTOR CALCULATIONS ---

  private calcDemandStrength(context: MatchedProposalContext, weight: number): IPriorityFactor {
    const raw = context.totalSubmissionsCount;
    // Scale: 40 submissions = 100 score
    const normalized = Math.min(100, Math.max(10, Math.round((raw / 40) * 100)));
    return {
      label: 'Demand Strength',
      rawValue: raw,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'submissions',
      explanation: `${raw} total citizen submissions recorded in this category/area`
    };
  }

  private calcUniqueCitizenReach(context: MatchedProposalContext, weight: number): IPriorityFactor {
    const raw = context.uniqueCitizensCount;
    // Scale: 30 unique citizens = 100 score
    const normalized = Math.min(100, Math.max(10, Math.round((raw / 30) * 100)));
    return {
      label: 'Unique Citizen Reach',
      rawValue: raw,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'citizens',
      explanation: `${raw} distinct citizens actively registered demands`
    };
  }

  private calcRecurrence(context: MatchedProposalContext, weight: number): IPriorityFactor {
    let normalized = 30;
    let status = 'ISOLATED';

    if (context.themes.length > 0) {
      const hasRecurring = context.themes.some(t => t.recurrenceStatus === 'RECURRING');
      const hasEmerging = context.themes.some(t => t.recurrenceStatus === 'EMERGING');
      if (hasRecurring) {
        normalized = 90;
        status = 'RECURRING';
      } else if (hasEmerging) {
        normalized = 65;
        status = 'EMERGING';
      } else {
        normalized = 40;
        status = 'ISOLATED';
      }
    }

    return {
      label: 'Demand Recurrence',
      rawValue: status,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'status',
      explanation: `Recurrence pattern classified as ${status} across observation window`
    };
  }

  private calcGeographicConcentration(context: MatchedProposalContext, weight: number): IPriorityFactor {
    const hotspotCount = context.hotspots.length;
    let normalized = 25;
    let explanation = 'No localized demand hotspot detected; scattered demand';

    if (hotspotCount > 0) {
      const avgIntensity = context.hotspots.reduce((sum, h) => sum + (h.intensity || 1), 0) / hotspotCount;
      normalized = Math.min(100, Math.max(30, Math.round(avgIntensity * 85)));
      explanation = `${hotspotCount} active demand hotspot(s) with ${avgIntensity.toFixed(2)} average intensity`;
    }

    return {
      label: 'Geographic Concentration',
      rawValue: hotspotCount,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'hotspots',
      explanation
    };
  }

  private calcContextualEvidence(context: MatchedProposalContext, weight: number): IPriorityFactor {
    const evidence = context.evidenceRecords;
    let normalized = 35; // baseline neutral
    let raw = '0 evidence records';
    let explanation = 'No contextual public datasets linked yet';

    if (evidence.length > 0) {
      const supporting = evidence.filter(e => e.evidenceType === 'SUPPORTING').length;
      const contradicting = evidence.filter(e => e.evidenceType === 'CONTRADICTING').length;
      const neutral = evidence.filter(e => e.evidenceType === 'NEUTRAL').length;
      const insufficient = evidence.filter(e => e.evidenceType === 'INSUFFICIENT_DATA').length;

      raw = `${supporting} supporting, ${contradicting} contradicting, ${neutral} neutral, ${insufficient} insufficient`;
      
      const score = ((supporting * 100) + (neutral * 50) + (insufficient * 25) - (contradicting * 50)) / evidence.length;
      normalized = Math.min(100, Math.max(0, Math.round(score)));
      explanation = `${supporting}/${evidence.length} supporting public data indicators`;
    }

    return {
      label: 'Contextual Evidence',
      rawValue: raw,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'records',
      explanation
    };
  }

  private calcInfrastructureGap(
    proposal: IDevelopmentProposal, 
    context: MatchedProposalContext, 
    weight: number
  ): IPriorityFactor {
    // Determine existing facilities in radius from contextual data records
    const categoryRecords = context.nearbyContextRecords.filter(
      r => r.category && r.category.toUpperCase() === proposal.category.toUpperCase()
    );

    const facilityCount = categoryRecords.length;
    let normalized = 50;
    let raw = `${facilityCount} existing facilities nearby`;
    let explanation = 'Moderate facility density detected in vicinity';

    if (facilityCount === 0) {
      normalized = 90;
      raw = '0 existing facilities within 5km';
      explanation = 'Severe infrastructure gap: No existing facilities detected in catchment area';
    } else if (facilityCount <= 2) {
      normalized = 75;
      raw = `${facilityCount} facility within 5km`;
      explanation = 'High infrastructure gap: Low facility density for local catchment';
    } else if (facilityCount <= 5) {
      normalized = 50;
      explanation = 'Moderate infrastructure coverage in local area';
    } else {
      normalized = 25;
      raw = `${facilityCount} facilities within 5km`;
      explanation = 'Low infrastructure gap: Area already has multiple facilities';
    }

    return {
      label: 'Infrastructure Gap',
      rawValue: raw,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'facilities',
      explanation
    };
  }

  private calcUrgency(context: MatchedProposalContext, weight: number): IPriorityFactor {
    const demands = context.demands;
    const severityMap: Record<string, number> = {
      LOW: 25,
      MEDIUM: 50,
      HIGH: 75,
      CRITICAL: 100
    };

    let normalized = 50;
    let raw = 'MEDIUM';

    if (demands.length > 0) {
      const total = demands.reduce((sum, d) => sum + (severityMap[d.urgency] || 50), 0);
      normalized = Math.round(total / demands.length);
      raw = normalized >= 75 ? 'HIGH / CRITICAL' : normalized >= 50 ? 'MEDIUM' : 'LOW';
    }

    return {
      label: 'Urgency',
      rawValue: raw,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'tier',
      explanation: `Average citizen urgency level assessed as ${raw}`
    };
  }

  private calcSeverity(context: MatchedProposalContext, weight: number): IPriorityFactor {
    const demands = context.demands;
    const severityMap: Record<string, number> = {
      LOW: 25,
      MEDIUM: 50,
      HIGH: 75,
      CRITICAL: 100
    };

    let normalized = 50;
    let raw = 'MEDIUM';

    if (demands.length > 0) {
      const total = demands.reduce((sum, d) => sum + (severityMap[d.severity] || 50), 0);
      normalized = Math.round(total / demands.length);
      raw = normalized >= 75 ? 'HIGH / CRITICAL' : normalized >= 50 ? 'MEDIUM' : 'LOW';
    }

    return {
      label: 'Severity',
      rawValue: raw,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'tier',
      explanation: `Average citizen severity impact assessed as ${raw}`
    };
  }

  private calcAffectedPopulation(
    proposal: IDevelopmentProposal, 
    context: MatchedProposalContext, 
    weight: number
  ): IPriorityFactor {
    const beneficiaries = proposal.beneficiaries || context.wardDemographics?.population || 0;
    let normalized = 40;
    let raw: string | number = beneficiaries;
    let explanation = 'Standard catchment population estimate';

    if (beneficiaries > 0) {
      // Scale: 30,000 residents = 100 score
      normalized = Math.min(100, Math.max(20, Math.round((beneficiaries / 30000) * 100)));
      explanation = `Direct catchment of ~${beneficiaries.toLocaleString()} estimated residents`;
    } else {
      raw = 'Population context unavailable';
      normalized = 40;
      explanation = 'Ward-level demographic data unavailable; using baseline cohort';
    }

    return {
      label: 'Affected Population',
      rawValue: raw,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'persons',
      explanation
    };
  }

  private calcEquityVulnerability(
    proposal: IDevelopmentProposal, 
    context: MatchedProposalContext, 
    weight: number
  ): IPriorityFactor {
    const targetGroups = proposal.targetGroups || [];
    const hasSlumContext = Boolean(context.wardDemographics?.slumPopulation && context.wardDemographics.slumPopulation > 0);

    let normalized = 35;
    let raw = `${targetGroups.length} target vulnerable group(s)`;

    if (targetGroups.length > 0 || hasSlumContext) {
      normalized = Math.min(100, 35 + (targetGroups.length * 15) + (hasSlumContext ? 25 : 0));
      raw = `${targetGroups.join(', ') || 'General'}${hasSlumContext ? ' (Documented Slum Pockets)' : ''}`;
    }

    return {
      label: 'Equity & Vulnerability',
      rawValue: raw,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'context',
      explanation: `Targeting vulnerable demographic pockets: ${raw}`
    };
  }

  private calcEvidenceConfidence(context: MatchedProposalContext, weight: number): IPriorityFactor {
    const evidence = context.evidenceRecords;
    let normalized = 40;
    let raw = 0.40;
    let explanation = 'Baseline confidence without formal dataset verification';

    if (evidence.length > 0) {
      const avgConf = evidence.reduce((sum, e) => sum + (e.confidence || 5), 0) / evidence.length;
      normalized = Math.min(100, Math.max(10, Math.round(avgConf * 10)));
      raw = Math.round((avgConf / 10) * 100) / 100;
      explanation = `Calculated across ${evidence.length} evidence records with mean confidence ${raw.toFixed(2)}`;
    }

    return {
      label: 'Evidence Confidence',
      rawValue: raw,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'confidence',
      explanation
    };
  }
}

export const priorityEngineService = new PriorityEngineService();
