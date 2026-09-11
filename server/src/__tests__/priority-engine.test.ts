import { priorityEngineService, DEFAULT_PRIORITY_WEIGHTS } from '../services/intelligence/PriorityEngineService';
import { impactEngineService } from '../services/intelligence/ImpactEngineService';
import { proposalMatchingService, MatchedProposalContext } from '../services/intelligence/ProposalMatchingService';
import { DevelopmentProposal, IDevelopmentProposal } from '../models/DevelopmentProposal';
import { PriorityAssessment } from '../models/PriorityAssessment';
import { ImpactAssessment } from '../models/ImpactAssessment';
import mongoose from 'mongoose';

describe('Phase 4 & Phase 5: Priority Engine & Impact Valuation', () => {

  const mockProposalId = new mongoose.Types.ObjectId();
  const mockProposal: any = {
    _id: mockProposalId,
    title: 'Ward 35 Healthcare Clinic',
    description: 'Construct urban PHC in Ward 35',
    category: 'HEALTHCARE',
    wardId: 'Ward 35',
    estimatedCost: 15000000,
    estimatedTimeline: '12 months',
    beneficiaries: 20000,
    targetGroups: ['Mothers', 'Children', 'Elderly'],
    source: 'DEMO_PROPOSAL',
    status: 'DRAFT',
    save: jest.fn().mockImplementation(function(this: any) { return Promise.resolve(this); })
  };

  const mockContext: MatchedProposalContext = {
    demands: [
      {
        _id: new mongoose.Types.ObjectId(),
        civicInputId: new mongoose.Types.ObjectId('65f1a1a1a1a1a1a1a1a1a101'),
        category: 'HEALTHCARE',
        title: 'Need clinic',
        summary: 'No clinic nearby',
        demandStatement: 'Need clinic in Ward 35',
        severity: 'HIGH',
        urgency: 'HIGH',
        language: 'en',
        confidence: 0.85,
        aiProvider: 'test',
        aiModel: 'test',
        processingStatus: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any,
      {
        _id: new mongoose.Types.ObjectId(),
        civicInputId: new mongoose.Types.ObjectId('65f1a1a1a1a1a1a1a1a1a102'),
        category: 'HEALTHCARE',
        title: 'Long distance travel for medicine',
        summary: 'Nearest hospital is 6km',
        demandStatement: 'We travel 6km for primary medicine',
        severity: 'CRITICAL',
        urgency: 'HIGH',
        language: 'or',
        confidence: 0.90,
        aiProvider: 'test',
        aiModel: 'test',
        processingStatus: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    ],
    themes: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Healthcare Access Deficit',
        summary: 'Recurring healthcare shortage',
        category: 'HEALTHCARE',
        recurrenceStatus: 'RECURRING',
        demandCount: 28,
        uniqueCitizenCount: 22,
        coherenceScore: 0.88,
        geographicSpread: 2.1,
        languageDistribution: { en: 10, or: 18 },
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    ],
    hotspots: [
      {
        _id: new mongoose.Types.ObjectId(),
        themeId: new mongoose.Types.ObjectId(),
        center: { type: 'Point', coordinates: [85.87, 20.29] },
        radius: 800,
        demandCount: 28,
        uniqueCitizenCount: 22,
        coherenceScore: 0.88,
        intensity: 0.92,
        firstObservedAt: new Date(),
        lastObservedAt: new Date(),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    ],
    evidenceRecords: [
      {
        _id: new mongoose.Types.ObjectId(),
        datasetId: new mongoose.Types.ObjectId() as any,
        dataRecordIds: [],
        evidenceType: 'SUPPORTING',
        indicator: 'Health facilities in 5km',
        observedValue: 0,
        relationship: 'Supports citizen claim of 0 clinics within 5km radius',
        evidenceStrength: 8,
        confidence: 9,
        source: 'OSM Amenities',
        explanation: 'Zero documented primary health clinics in ward boundary.',
        generatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    ],
    nearbyContextRecords: [],
    uniqueCitizensCount: 22,
    totalSubmissionsCount: 28,
    wardDemographics: {
      population: 25000,
      slumPopulation: 6000
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PriorityEngineService Determinism & Scoring', () => {
    it('should calculate normalized factors within 0-100 range', async () => {
      jest.spyOn(DevelopmentProposal, 'findById').mockResolvedValue(mockProposal as any);
      jest.spyOn(proposalMatchingService, 'matchContextForProposal').mockResolvedValue(mockContext);
      jest.spyOn(PriorityAssessment, 'findOne').mockResolvedValue(null);
      jest.spyOn(PriorityAssessment, 'create').mockImplementation((data: any) => Promise.resolve(data));

      const assessment = await priorityEngineService.evaluateProposal(mockProposalId.toString());

      expect(assessment.totalScore).toBeGreaterThanOrEqual(0);
      expect(assessment.totalScore).toBeLessThanOrEqual(100);

      // Verify all 11 factors exist and are between 0 and 100
      const factors = assessment.factors;
      expect(factors.demandStrength.normalizedValue).toBeGreaterThanOrEqual(0);
      expect(factors.demandStrength.normalizedValue).toBeLessThanOrEqual(100);
      expect(factors.uniqueCitizenReach.normalizedValue).toBeGreaterThanOrEqual(0);
      expect(factors.recurrence.normalizedValue).toBe(90); // RECURRING = 90
      expect(factors.infrastructureGap.normalizedValue).toBe(90); // 0 facilities = 90
      expect(factors.contextualEvidence.normalizedValue).toBe(100); // 100% supporting
      expect(factors.urgency.normalizedValue).toBe(75); // HIGH = 75
      expect(factors.severity.normalizedValue).toBe(88); // avg of HIGH(75) & CRITICAL(100) = 87.5 -> 88
    });

    it('CRITICAL: must produce exact identical priority score when evaluated twice (deterministic guarantee)', async () => {
      jest.spyOn(DevelopmentProposal, 'findById').mockResolvedValue(mockProposal as any);
      jest.spyOn(proposalMatchingService, 'matchContextForProposal').mockResolvedValue(mockContext);
      jest.spyOn(PriorityAssessment, 'findOne').mockResolvedValue(null);
      jest.spyOn(PriorityAssessment, 'create').mockImplementation((data: any) => Promise.resolve(data));

      const run1 = await priorityEngineService.evaluateProposal(mockProposalId.toString());
      const run2 = await priorityEngineService.evaluateProposal(mockProposalId.toString());

      expect(run1.totalScore).toEqual(run2.totalScore);
      expect(run1.factors.demandStrength.contribution).toEqual(run2.factors.demandStrength.contribution);
      expect(run1.factors.infrastructureGap.contribution).toEqual(run2.factors.infrastructureGap.contribution);
      expect(run1.factors.contextualEvidence.contribution).toEqual(run2.factors.contextualEvidence.contribution);
    });

    it('should respect custom weight configurations', async () => {
      jest.spyOn(DevelopmentProposal, 'findById').mockResolvedValue(mockProposal as any);
      jest.spyOn(proposalMatchingService, 'matchContextForProposal').mockResolvedValue(mockContext);
      jest.spyOn(PriorityAssessment, 'findOne').mockResolvedValue(null);
      jest.spyOn(PriorityAssessment, 'create').mockImplementation((data: any) => Promise.resolve(data));

      // Custom weights emphasizing infrastructure gap and demand
      const customWeights = {
        ...DEFAULT_PRIORITY_WEIGHTS,
        infrastructureGap: 0.30,
        demandStrength: 0.25
      };

      const assessment = await priorityEngineService.evaluateProposal(mockProposalId.toString(), customWeights);
      expect(assessment.factors.infrastructureGap.weight).toBe(0.30);
      expect(assessment.factors.demandStrength.weight).toBe(0.25);
    });

    it('should handle missing demographic and context gracefully without crashing', async () => {
      const emptyProposal: any = {
        _id: mockProposalId,
        title: 'Empty Proposal',
        description: 'No demographic data',
        category: 'HEALTHCARE',
        beneficiaries: 0,
        save: jest.fn().mockImplementation(function(this: any) { return Promise.resolve(this); })
      };

      const emptyContext: MatchedProposalContext = {
        demands: [],
        themes: [],
        hotspots: [],
        evidenceRecords: [],
        nearbyContextRecords: [],
        uniqueCitizensCount: 0,
        totalSubmissionsCount: 0
      };

      jest.spyOn(DevelopmentProposal, 'findById').mockResolvedValue(emptyProposal as any);
      jest.spyOn(proposalMatchingService, 'matchContextForProposal').mockResolvedValue(emptyContext);
      jest.spyOn(PriorityAssessment, 'findOne').mockResolvedValue(null);
      jest.spyOn(PriorityAssessment, 'create').mockImplementation((data: any) => Promise.resolve(data));

      const assessment = await priorityEngineService.evaluateProposal(mockProposalId.toString());
      expect(assessment.totalScore).toBeDefined();
      expect(String(assessment.factors.affectedPopulation.rawValue)).toContain('Population context unavailable');
      expect(assessment.explanation.limitations.length).toBeGreaterThan(0);
    });
  });

  describe('ImpactEngineService Social & Economic Valuation', () => {
    it('should calculate social impact dimensions and scenarios', async () => {
      jest.spyOn(DevelopmentProposal, 'findById').mockResolvedValue(mockProposal as any);
      jest.spyOn(proposalMatchingService, 'matchContextForProposal').mockResolvedValue(mockContext);
      jest.spyOn(ImpactAssessment, 'findOne').mockResolvedValue(null);
      jest.spyOn(ImpactAssessment, 'create').mockImplementation((data: any) => Promise.resolve(data));

      const impact = await impactEngineService.evaluateImpact(mockProposalId.toString());

      expect(impact.socialImpactScore).toBeGreaterThanOrEqual(0);
      expect(impact.socialImpactScore).toBeLessThanOrEqual(100);
      
      // Check scenarios
      expect(impact.scenarios.conservative.beneficiaries).toBe(14000); // 70% of 20000
      expect(impact.scenarios.baseline.beneficiaries).toBe(20000);
      expect(impact.scenarios.optimistic.beneficiaries).toBe(27000); // 135% of 20000

      // Check confidence and uncertainty
      expect(impact.confidence).toBeGreaterThan(0);
      expect(impact.confidence).toBeLessThanOrEqual(1.0);
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(impact.uncertainty);

      // Check assumptions
      expect(impact.assumptions.length).toBeGreaterThanOrEqual(2);
    });

    it('should mark ungrounded economic metrics as NOT_AVAILABLE without fabricating numbers', async () => {
      jest.spyOn(DevelopmentProposal, 'findById').mockResolvedValue(mockProposal as any);
      jest.spyOn(proposalMatchingService, 'matchContextForProposal').mockResolvedValue(mockContext);
      jest.spyOn(ImpactAssessment, 'findOne').mockResolvedValue(null);
      jest.spyOn(ImpactAssessment, 'create').mockImplementation((data: any) => Promise.resolve(data));

      const impact = await impactEngineService.evaluateImpact(mockProposalId.toString());

      // For HEALTHCARE category, travel time savings without transit data must be NOT_AVAILABLE
      expect(impact.economicFactors.travelTimeSavings.status).toBe('NOT_AVAILABLE');
      expect(impact.economicFactors.travelTimeSavings.contribution).toBeUndefined();
    });
  });

});
