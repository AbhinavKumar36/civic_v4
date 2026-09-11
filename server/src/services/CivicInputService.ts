import { CivicInput, ICivicInput } from '../models/CivicInput';
import { normalizationService } from './NormalizationService';
import { NormalizedDemand } from '../models/NormalizedDemand';
import { Types } from 'mongoose';

export class CivicInputService {
  async submitInput(data: {
    citizenId: string;
    inputType: 'TEXT' | 'VOICE' | 'IMAGE' | 'MULTIMODAL';
    text?: string;
    originalLanguage?: string;
    media?: string[];
    location?: { type: 'Point', coordinates: [number, number] };
  }): Promise<ICivicInput> {
    
    const input = new CivicInput({
      citizenId: new Types.ObjectId(data.citizenId),
      inputType: data.inputType,
      text: data.text,
      originalLanguage: data.originalLanguage || 'en',
      media: data.media || [],
      location: data.location,
      status: 'RECEIVED'
    });

    await input.save();

    // Trigger normalization asynchronously (fire and forget for Phase 1)
    // A robust message queue is for future phases.
    normalizationService.process(input).catch(console.error);

    return input;
  }

  async retryProcessing(inputId: string, citizenId: string): Promise<ICivicInput> {
    const input = await CivicInput.findOne({ _id: inputId, citizenId });
    if (!input) throw new Error('CivicInput not found or unauthorized');

    if (input.status !== 'FAILED') {
      throw new Error('Can only retry failed inputs');
    }

    normalizationService.process(input).catch(console.error);
    return input;
  }

  async getCitizenInputs(citizenId: string) {
    return CivicInput.find({ citizenId }).sort({ createdAt: -1 });
  }

  async getNormalizedDemandsForAuthority(filters: any) {
    // Basic authority list query
    const query: any = {};
    if (filters.category) query.category = filters.category;
    if (filters.urgency) query.urgency = filters.urgency;
    if (filters.severity) query.severity = filters.severity;
    
    return NormalizedDemand.find(query).sort({ createdAt: -1 });
  }

  async getNormalizedDemandDetail(id: string) {
    return NormalizedDemand.findById(id).populate('civicInputId');
  }

  async getNormalizedDemandByInputId(inputId: string, citizenId: string) {
    // First verify that the input actually belongs to the citizen
    const input = await CivicInput.findOne({ _id: inputId, citizenId });
    if (!input) throw new Error('CivicInput not found or unauthorized');

    // Then find the corresponding normalized demand
    return NormalizedDemand.findOne({ civicInputId: inputId });
  }
}

export const civicInputService = new CivicInputService();
