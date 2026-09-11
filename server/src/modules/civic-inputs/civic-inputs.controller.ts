import { Request, Response } from 'express';
import { civicInputService } from '../../services/CivicInputService';
import { z } from 'zod';
import { storageService } from '../../services/storage/LocalStorageProvider';

const submitSchema = z.object({
  inputType: z.enum(['TEXT', 'VOICE', 'IMAGE', 'MULTIMODAL']),
  text: z.string().optional(),
  originalLanguage: z.string().optional(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()])
  }).optional()
});

export const submitInput = async (req: Request, res: Response) => {
  try {
    if (req.body.location && typeof req.body.location === 'string') {
      req.body.location = JSON.parse(req.body.location);
    }
    const data = submitSchema.parse(req.body);
    const citizenId = (req as any).user.userId;

    let media: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      media = req.files.map(file => storageService.getFileUrl(file.filename));
    }

    const input = await civicInputService.submitInput({
      citizenId,
      inputType: data.inputType,
      text: data.text,
      originalLanguage: data.originalLanguage,
      location: data.location,
      media
    });

    res.status(201).json({ success: true, data: input });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const getMyInputs = async (req: Request, res: Response) => {
  try {
    const citizenId = (req as any).user.userId;
    const inputs = await civicInputService.getCitizenInputs(citizenId);
    res.json({ success: true, data: inputs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

export const retryInput = async (req: Request, res: Response) => {
  try {
    const citizenId = (req as any).user.userId;
    const id = req.params.id as string;
    const input = await civicInputService.retryProcessing(id, citizenId);
    res.json({ success: true, data: input });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const getNormalizedDemands = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const demands = await civicInputService.getNormalizedDemandsForAuthority(filters);
    res.json({ success: true, data: demands });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

export const getNormalizedDemandById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const demand = await civicInputService.getNormalizedDemandDetail(id);
    if (!demand) throw new Error('Not found');
    res.json({ success: true, data: demand });
  } catch (error: any) {
    res.status(404).json({ success: false, error: { message: error.message } });
  }
};

export const getNormalizedResultForInput = async (req: Request, res: Response) => {
  try {
    const citizenId = (req as any).user.userId;
    const inputId = req.params.id as string;
    const result = await civicInputService.getNormalizedDemandByInputId(inputId, citizenId);
    if (!result) throw new Error('Result not found or not yet processed');
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(404).json({ success: false, error: { message: error.message } });
  }
};
