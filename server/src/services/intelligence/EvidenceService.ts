import { EvidenceRecord } from '../../models/EvidenceRecord';
import { NormalizedDemand, INormalizedDemand } from '../../models/NormalizedDemand';
import { geoContextService } from '../data/GeoContextService';
import { geminiProvider } from '../ai/GeminiProvider';
import { Types } from 'mongoose';

export class EvidenceService {
  
  /**
   * Generates evidence for a single demand by checking surrounding contextual data.
   */
  async generateEvidenceForDemand(demandId: string) {
    const demand = await NormalizedDemand.findById(demandId);
    if (!demand || !demand.location) throw new Error('Demand not found or missing location');

    const [lon, lat] = demand.location.coordinates;
    const radiusMeters = 5000; // Look within 5km for context

    // For simplicity, we just fetch all categories of data near the demand
    // In a mature system, we would map Demand Category -> Relevant Dataset Categories
    const nearbyRecords = await geoContextService.findNearbyRecords(lon, lat, radiusMeters);

    if (nearbyRecords.length === 0) {
      // Create an insufficient data record
      const insufficientRecord = new EvidenceRecord({
        demandId: demand._id,
        dataRecordIds: [],
        evidenceType: 'INSUFFICIENT_DATA',
        indicator: 'Data Availability',
        observedValue: 0,
        relationship: 'No contextual datasets found within 5km of the reported issue.',
        evidenceStrength: 0,
        confidence: 0,
        source: 'System',
        explanation: 'No public datasets have been imported for this geographic area to verify or provide context to the citizen report.'
      });
      await insufficientRecord.save();
      return [insufficientRecord];
    }

    // Group records by Dataset to generate specific evidence per dataset
    const recordsByDataset: Record<string, any[]> = {};
    for (const record of nearbyRecords) {
      const dsId = record.datasetId._id.toString();
      if (!recordsByDataset[dsId]) recordsByDataset[dsId] = [];
      recordsByDataset[dsId].push(record);
    }

    const createdEvidence = [];

    for (const dsId of Object.keys(recordsByDataset)) {
      const records = recordsByDataset[dsId];
      const dataset = records[0].datasetId; // populated
      
      // Calculate a basic indicator (e.g. Count of facilities nearby)
      const indicator = `Count of ${dataset.category} facilities within ${radiusMeters/1000}km`;
      const observedValue = records.length;
      
      // Use AI to generate a contextual explanation (NOT a priority score)
      const evidence = await this.evaluateEvidenceWithAI(demand.demandStatement, dataset.name, indicator, observedValue, records);
      
      const evidenceRecord = new EvidenceRecord({
        demandId: demand._id,
        datasetId: dataset._id,
        dataRecordIds: records.map(r => r._id),
        evidenceType: evidence.evidenceType,
        indicator,
        observedValue,
        relationship: evidence.relationship,
        evidenceStrength: evidence.evidenceStrength,
        confidence: evidence.confidence,
        source: dataset.source,
        explanation: evidence.explanation
      });
      
      await evidenceRecord.save();
      createdEvidence.push(evidenceRecord);
    }

    return createdEvidence;
  }

  private async evaluateEvidenceWithAI(demandStatement: string, datasetName: string, indicator: string, observedValue: number, records: any[]) {
    // We pass a sample of the records attributes to give the AI context without overloading the prompt
    const sampleAttributes = records.slice(0, 3).map(r => r.attributes);

    const prompt = `
      You are an objective data analyst providing Civic Intelligence.
      A citizen has submitted the following demand/complaint:
      "${demandStatement}"

      We have queried public/contextual datasets to provide context.
      Dataset: ${datasetName}
      Calculated Indicator: ${indicator}
      Observed Value: ${observedValue}
      Sample Data Attributes: ${JSON.stringify(sampleAttributes)}

      Your task is to reconcile the citizen's perception with the documented public data.
      DO NOT invent data. DO NOT provide a priority score. DO NOT recommend funding.

      Determine the relationship between the citizen's demand and the public data.
      EvidenceType must be one of: 'SUPPORTING', 'CONTRADICTING', 'NEUTRAL', 'INSUFFICIENT_DATA'.
      
      Examples:
      - If citizen complains about lack of schools, and observedValue (schools nearby) is 0, evidenceType = SUPPORTING.
      - If citizen complains about lack of hospitals, and observedValue (hospitals nearby) is 5, evidenceType = CONTRADICTING (or NEUTRAL if attributes suggest they are full/unusable).
      
      Respond strictly with JSON.
    `;

    const schema = {
      type: "object",
      properties: {
        evidenceType: { type: "string", enum: ['SUPPORTING', 'CONTRADICTING', 'NEUTRAL', 'INSUFFICIENT_DATA'] },
        relationship: { type: "string", description: "A 1-sentence summary of the relationship between perception and data." },
        explanation: { type: "string", description: "A 2-3 sentence detailed explanation grounding the citizen claim in the documented data." },
        evidenceStrength: { type: "number", description: "Scale 1-10 on how strongly this dataset relates to the demand category." },
        confidence: { type: "number", description: "Scale 1-10 on the confidence of this interpretation based purely on the provided numbers." }
      },
      required: ["evidenceType", "relationship", "explanation", "evidenceStrength", "confidence"]
    };

    return await geminiProvider.generateStructuredOutput(prompt, schema);
  }
}

export const evidenceService = new EvidenceService();
