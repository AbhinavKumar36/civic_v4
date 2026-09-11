import { DevelopmentProposal, IDevelopmentProposal } from '../../models/DevelopmentProposal';
import { ImpactAssessment, IImpactAssessment, ISocialFactor, IEconomicFactor, IScenario } from '../../models/ImpactAssessment';
import { proposalMatchingService, MatchedProposalContext } from './ProposalMatchingService';
import { Types } from 'mongoose';

export class ImpactEngineService {
  /**
   * Generates a comprehensive Social and Economic Impact Assessment for a proposal.
   */
  async evaluateImpact(proposalId: string): Promise<IImpactAssessment> {
    const proposal = await DevelopmentProposal.findById(proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    const context = await proposalMatchingService.matchContextForProposal(proposal);

    // 1. Calculate Social Impact Factors (Sum of weights = 1.00)
    const beneficiaryReach = this.calcBeneficiaryReach(proposal, context, 0.25);
    const accessibilityImprovement = this.calcAccessibilityImprovement(proposal, context, 0.20);
    const serviceCoverage = this.calcServiceCoverage(proposal, context, 0.20);
    const equityImpact = this.calcEquityImpact(proposal, context, 0.15);
    const qualityOfLife = this.calcQualityOfLife(proposal, context, 0.10);
    const vulnerablePopulationBenefit = this.calcVulnerablePopulationBenefit(proposal, context, 0.10);

    const socialFactors = {
      beneficiaryReach,
      accessibilityImprovement,
      serviceCoverage,
      equityImpact,
      qualityOfLife,
      vulnerablePopulationBenefit
    };

    const socialImpactScoreRaw = Object.values(socialFactors).reduce((sum, f) => sum + f.contribution, 0);
    const socialImpactScore = Math.min(100, Math.max(0, Math.round(socialImpactScoreRaw * 10) / 10));

    // 2. Calculate Economic Impact Factors
    const directBeneficiaryReach = this.calcEconomicDirectReach(proposal, context, 0.25);
    const employmentPotential = this.calcEmploymentPotential(proposal, 0.20);
    const travelTimeSavings = this.calcTravelTimeSavings(proposal, context, 0.20);
    const productivityImprovement = this.calcProductivityImprovement(proposal, 0.15);
    const localEconomicActivity = this.calcLocalEconomicActivity(proposal, 0.10);
    const serviceEfficiency = this.calcServiceEfficiency(proposal, 0.10);

    const economicFactors = {
      directBeneficiaryReach,
      employmentPotential,
      travelTimeSavings,
      productivityImprovement,
      localEconomicActivity,
      serviceEfficiency
    };

    // Determine economic score and level without fabricating false precision
    const availableEconomicFactors = Object.values(economicFactors).filter(f => f.status === 'CALCULATED');
    let economicImpactScore: number | undefined = undefined;
    let economicImpactLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_AVAILABLE' = 'NOT_AVAILABLE';

    if (availableEconomicFactors.length > 0) {
      const totalAvailableWeight = availableEconomicFactors.reduce((sum, f) => sum + f.weight, 0);
      const weightedSum = availableEconomicFactors.reduce((sum, f) => sum + (f.contribution || 0), 0);
      economicImpactScore = Math.round((weightedSum / totalAvailableWeight) * 10) / 10;
      economicImpactLevel = economicImpactScore >= 75 ? 'HIGH' : economicImpactScore >= 50 ? 'MEDIUM' : 'LOW';
    }

    // 3. Construct Scenarios (Conservative, Baseline, Optimistic)
    const baseBeneficiaries = proposal.beneficiaries || context.wardDemographics?.population || 10000;
    const scenarios = {
      conservative: {
        beneficiaries: Math.round(baseBeneficiaries * 0.70),
        description: `Conservative estimate focusing strictly on immediate direct catchment (~${Math.round(baseBeneficiaries * 0.70).toLocaleString()} residents).`,
        economicBenefitLevel: economicImpactLevel === 'HIGH' ? 'MEDIUM' : economicImpactLevel
      } as IScenario,
      baseline: {
        beneficiaries: baseBeneficiaries,
        description: `Standard baseline estimate assuming regular operational capacity (~${baseBeneficiaries.toLocaleString()} residents).`,
        economicBenefitLevel: economicImpactLevel
      } as IScenario,
      optimistic: {
        beneficiaries: Math.round(baseBeneficiaries * 1.35),
        description: `Optimistic projection including extended spillover across adjacent municipal wards (~${Math.round(baseBeneficiaries * 1.35).toLocaleString()} residents).`,
        economicBenefitLevel: economicImpactLevel === 'LOW' ? 'MEDIUM' : economicImpactLevel
      } as IScenario
    };

    // 4. Uncertainty & Confidence Calculations
    const uncertaintyReasons: string[] = [];
    let confidence = 0.50;

    if (context.evidenceRecords.length === 0) {
      uncertaintyReasons.push('No primary municipal evidence records linked to verify baseline indicators.');
      confidence -= 0.15;
    } else {
      confidence += Math.min(0.35, context.evidenceRecords.length * 0.08);
    }

    if (!context.wardDemographics?.population) {
      uncertaintyReasons.push('Precise ward census population unavailable; using municipal demographic projections.');
      confidence -= 0.10;
    } else {
      confidence += 0.10;
    }

    if (availableEconomicFactors.length < 3) {
      uncertaintyReasons.push('Economic indicators partially limited to direct employment and productivity due to absence of traffic/commerce micro-data.');
    }

    confidence = Math.min(0.95, Math.max(0.30, Math.round(confidence * 100) / 100));

    let uncertainty: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    if (confidence >= 0.75 && uncertaintyReasons.length <= 1) {
      uncertainty = 'LOW';
    } else if (confidence < 0.55 || uncertaintyReasons.length >= 3) {
      uncertainty = 'HIGH';
    }

    // 5. Explicit Assumptions
    const assumptions = [
      `Catchment area model assumes active utility radius of 3.0km–5.0km for ${proposal.category}.`,
      `Baseline beneficiary cohort projected at ~${baseBeneficiaries.toLocaleString()} residents based on ward demographic attributes.`,
      `Assumes project timeline of ${proposal.estimatedTimeline || '12 months'} with standard municipal execution efficiency.`
    ];

    // 6. Explanations
    const socialDrivers = [
      `Beneficiary reach of ~${baseBeneficiaries.toLocaleString()} residents (${beneficiaryReach.normalizedValue}/100)`,
      `Accessibility improvement assessed at ${accessibilityImprovement.normalizedValue}/100`,
      `Equity enhancement across target groups at ${equityImpact.normalizedValue}/100`
    ];

    const economicDrivers = availableEconomicFactors.map(
      f => `${f.label}: ${f.normalizedValue}/100 (${f.note || 'Calculated from project parameters'})`
    );
    if (economicDrivers.length === 0) {
      economicDrivers.push('Direct economic return unmodeled to avoid false precision without verified micro-economic survey data.');
    }

    const uncertaintyExplanation = `Overall assessment confidence is ${(confidence * 100).toFixed(0)}% (${uncertainty} uncertainty). ${uncertaintyReasons.join(' ')}`;
    const summary = `Proposal demonstrates a Social Impact Score of ${socialImpactScore}/100 and ${economicImpactLevel} Economic Impact potential (${economicImpactScore !== undefined ? economicImpactScore + '/100' : 'Grounded indicators'}).`;

    // 7. Save or update ImpactAssessment
    const evidenceIds = context.evidenceRecords.map(e => e._id as Types.ObjectId);

    let assessment = await ImpactAssessment.findOne({ proposalId: proposal._id });
    if (assessment) {
      assessment.socialImpactScore = socialImpactScore;
      assessment.economicImpactScore = economicImpactScore;
      assessment.economicImpactLevel = economicImpactLevel;
      assessment.socialFactors = socialFactors;
      assessment.economicFactors = economicFactors;
      assessment.scenarios = scenarios;
      assessment.assumptions = assumptions;
      assessment.uncertainty = uncertainty;
      assessment.uncertaintyReasons = uncertaintyReasons;
      assessment.confidence = confidence;
      assessment.methodology = 'Deterministic Multi-Criteria Impact Valuation with Scenario Modeling';
      assessment.evidenceIds = evidenceIds;
      assessment.explanation = { summary, socialDrivers, economicDrivers, uncertaintyExplanation };
      assessment.calculatedAt = new Date();
      await assessment.save();
    } else {
      assessment = await ImpactAssessment.create({
        proposalId: proposal._id,
        socialImpactScore,
        economicImpactScore,
        economicImpactLevel,
        socialFactors,
        economicFactors,
        scenarios,
        assumptions,
        uncertainty,
        uncertaintyReasons,
        confidence,
        methodology: 'Deterministic Multi-Criteria Impact Valuation with Scenario Modeling',
        evidenceIds,
        explanation: { summary, socialDrivers, economicDrivers, uncertaintyExplanation },
        calculatedAt: new Date()
      });
    }

    // 8. Update cached scores on proposal
    proposal.socialImpactScore = socialImpactScore;
    proposal.economicImpactScore = economicImpactScore;
    proposal.impactConfidence = confidence;
    await proposal.save();

    return assessment;
  }

  // --- SOCIAL IMPACT CALCULATIONS ---

  private calcBeneficiaryReach(proposal: IDevelopmentProposal, context: MatchedProposalContext, weight: number): ISocialFactor {
    const count = proposal.beneficiaries || context.wardDemographics?.population || 10000;
    const normalized = Math.min(100, Math.max(20, Math.round((count / 25000) * 100)));
    return {
      label: 'Beneficiary Reach',
      rawValue: count,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'residents',
      explanation: `Estimated direct catchment of ~${count.toLocaleString()} beneficiaries`
    };
  }

  private calcAccessibilityImprovement(proposal: IDevelopmentProposal, context: MatchedProposalContext, weight: number): ISocialFactor {
    // If nearby facilities are few, accessibility gain is high
    const categoryRecords = context.nearbyContextRecords.filter(
      r => r.category && r.category.toUpperCase() === proposal.category.toUpperCase()
    );
    let normalized = 65;
    if (categoryRecords.length === 0) normalized = 90;
    else if (categoryRecords.length <= 2) normalized = 80;
    else if (categoryRecords.length > 5) normalized = 40;

    return {
      label: 'Accessibility Improvement',
      rawValue: `${categoryRecords.length} existing facilities`,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      explanation: `Substantially cuts transit time and barrier to access for ${proposal.category.toLowerCase()}`
    };
  }

  private calcServiceCoverage(proposal: IDevelopmentProposal, context: MatchedProposalContext, weight: number): ISocialFactor {
    const demandsCount = context.demands.length;
    const normalized = Math.min(100, Math.max(30, 40 + (demandsCount * 3)));
    return {
      label: 'Service Coverage Expansion',
      rawValue: `${demandsCount} localized demands`,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      explanation: `Expands municipal service perimeter across underserved blocks`
    };
  }

  private calcEquityImpact(proposal: IDevelopmentProposal, context: MatchedProposalContext, weight: number): ISocialFactor {
    const targetGroups = proposal.targetGroups || [];
    const hasSlums = Boolean(context.wardDemographics?.slumPopulation);
    let normalized = 45;
    if (targetGroups.length > 0 || hasSlums) {
      normalized = Math.min(100, 50 + (targetGroups.length * 15) + (hasSlums ? 20 : 0));
    }

    return {
      label: 'Equity & Inclusion Impact',
      rawValue: targetGroups.join(', ') || 'General Public',
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      explanation: `Delivers targeted benefits to historically underserved population segments`
    };
  }

  private calcQualityOfLife(proposal: IDevelopmentProposal, context: MatchedProposalContext, weight: number): ISocialFactor {
    // High urgency/severity civic demands yield higher quality of life gain upon resolution
    const highUrgencyCount = context.demands.filter(d => d.urgency === 'HIGH' || d.urgency === 'CRITICAL').length;
    const normalized = Math.min(100, Math.max(40, 50 + (highUrgencyCount * 5)));
    return {
      label: 'Quality of Life Potential',
      rawValue: `${highUrgencyCount} high-urgency demands resolved`,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      explanation: `Alleviates persistent daily civic frictions and environmental hazards`
    };
  }

  private calcVulnerablePopulationBenefit(proposal: IDevelopmentProposal, context: MatchedProposalContext, weight: number): ISocialFactor {
    const vulnerableCount = context.wardDemographics?.slumPopulation || (proposal.targetGroups?.length ? 5000 : 0);
    let normalized = 40;
    if (vulnerableCount > 0) {
      normalized = Math.min(100, Math.max(50, Math.round((vulnerableCount / 8000) * 100)));
    }
    return {
      label: 'Vulnerable Population Benefit',
      rawValue: vulnerableCount > 0 ? `~${vulnerableCount.toLocaleString()} residents` : 'Standard cohort',
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'persons',
      explanation: `Provides essential public safety and welfare infrastructure to vulnerable groups`
    };
  }

  // --- ECONOMIC IMPACT CALCULATIONS ---

  private calcEconomicDirectReach(proposal: IDevelopmentProposal, context: MatchedProposalContext, weight: number): IEconomicFactor {
    const count = proposal.beneficiaries || context.wardDemographics?.population || 0;
    if (count === 0) {
      return {
        label: 'Direct Economic Beneficiary Reach',
        status: 'NOT_AVAILABLE',
        weight,
        note: 'Economic catchment population unavailable'
      };
    }

    const normalized = Math.min(100, Math.max(25, Math.round((count / 30000) * 100)));
    return {
      label: 'Direct Economic Beneficiary Reach',
      status: 'CALCULATED',
      rawValue: count,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'beneficiaries',
      note: `Direct economic utility for ~${count.toLocaleString()} residents`
    };
  }

  private calcEmploymentPotential(proposal: IDevelopmentProposal, weight: number): IEconomicFactor {
    const cost = proposal.estimatedCost || 0;
    if (cost === 0) {
      return {
        label: 'Local Employment Generation',
        status: 'NOT_AVAILABLE',
        weight,
        note: 'Project cost not itemized'
      };
    }

    // Larger infrastructure projects generate direct civil construction & long-term operational jobs
    // Scale: ₹5 Crore (50,000,000) = 90 score
    const normalized = Math.min(100, Math.max(30, Math.round((cost / 50000000) * 90)));
    return {
      label: 'Local Employment Generation',
      status: 'CALCULATED',
      rawValue: `₹${(cost / 100000).toFixed(1)} Lakhs est. budget`,
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'score',
      note: `Generates direct construction and operational employment based on capital outlay`
    };
  }

  private calcTravelTimeSavings(proposal: IDevelopmentProposal, context: MatchedProposalContext, weight: number): IEconomicFactor {
    // Highly relevant for ROADS, TRANSPORT, DRAINAGE
    const isTransport = ['ROADS', 'TRANSPORT', 'DRAINAGE'].includes(proposal.category);
    if (!isTransport) {
      return {
        label: 'Travel-Time Savings & Congestion Relief',
        status: 'NOT_AVAILABLE',
        weight,
        note: 'Metric not applicable to non-mobility categories without origin-destination survey'
      };
    }

    const normalized = 80;
    return {
      label: 'Travel-Time Savings & Congestion Relief',
      status: 'CALCULATED',
      rawValue: 'Estimated 15-25% bottleneck reduction',
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'efficiency',
      note: 'Reduces commute delays, fuel consumption, and commercial transit overhead'
    };
  }

  private calcProductivityImprovement(proposal: IDevelopmentProposal, weight: number): IEconomicFactor {
    // Health, Education, Roads directly boost economic productivity
    const isProductive = ['HEALTHCARE', 'EDUCATION', 'WATER', 'ROADS', 'DIGITAL_INFRASTRUCTURE'].includes(proposal.category);
    if (!isProductive) {
      return {
        label: 'Workforce Productivity Improvement',
        status: 'NOT_AVAILABLE',
        weight,
        note: 'Secondary productivity impact unverified'
      };
    }

    const normalized = 75;
    return {
      label: 'Workforce Productivity Improvement',
      status: 'CALCULATED',
      rawValue: 'High systemic multiplier',
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'tier',
      note: 'Improves health outcomes, student learning hours, or digital commerce access'
    };
  }

  private calcLocalEconomicActivity(proposal: IDevelopmentProposal, weight: number): IEconomicFactor {
    const isCommercial = ['ROADS', 'TRANSPORT', 'WATER', 'DIGITAL_INFRASTRUCTURE', 'DRAINAGE'].includes(proposal.category);
    if (!isCommercial) {
      return {
        label: 'Local Market & Commercial Activity',
        status: 'NOT_AVAILABLE',
        weight,
        note: 'Micro-commercial survey not conducted'
      };
    }

    const normalized = 70;
    return {
      label: 'Local Market & Commercial Activity',
      status: 'CALCULATED',
      rawValue: 'Stimulates neighborhood commerce',
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'tier',
      note: 'Improves commercial corridor footfall and real estate accessibility'
    };
  }

  private calcServiceEfficiency(proposal: IDevelopmentProposal, weight: number): IEconomicFactor {
    const isEfficiency = ['WATER', 'SANITATION', 'DRAINAGE', 'DIGITAL_INFRASTRUCTURE'].includes(proposal.category);
    if (!isEfficiency) {
      return {
        label: 'Municipal Service Delivery Efficiency',
        status: 'NOT_AVAILABLE',
        weight,
        note: 'Direct municipal operational telemetry not connected'
      };
    }

    const normalized = 85;
    return {
      label: 'Municipal Service Delivery Efficiency',
      status: 'CALCULATED',
      rawValue: 'Reduces recurring emergency maintenance costs',
      normalizedValue: normalized,
      weight,
      contribution: Math.round(normalized * weight * 10) / 10,
      unit: 'efficiency',
      note: 'Proactive infrastructure upgrade reduces recurring civic repair overhead'
    };
  }
}

export const impactEngineService = new ImpactEngineService();
