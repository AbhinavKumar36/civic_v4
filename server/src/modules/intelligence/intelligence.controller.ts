import { Request, Response } from 'express';
import { intelligencePipeline } from '../../services/intelligence/IntelligencePipeline';
import { Theme } from '../../models/Theme';
import { DemandHotspot } from '../../models/DemandHotspot';
import { NormalizedDemand } from '../../models/NormalizedDemand';

export const processIntelligence = async (req: Request, res: Response) => {
  try {
    const result = await intelligencePipeline.runPipeline();
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[IntelligenceController] Processing Error:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getThemes = async (req: Request, res: Response) => {
  try {
    const themes = await Theme.find().sort({ demandCount: -1 });
    res.json({ success: true, data: themes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getThemeById = async (req: Request, res: Response) => {
  try {
    const themeId = req.params.id;
    const theme = await Theme.findById(themeId).populate('representativeDemandId');
    if (!theme) throw new Error('Theme not found');

    const demands = await NormalizedDemand.find({ themeId });
    
    res.json({ success: true, data: { theme, demands } });
  } catch (error: any) {
    res.status(404).json({ success: false, error: { message: error.message } });
  }
};

export const getHotspots = async (req: Request, res: Response) => {
  try {
    const hotspots = await DemandHotspot.find().populate('themeId').sort({ intensity: -1 });
    res.json({ success: true, data: hotspots });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getHotspotById = async (req: Request, res: Response) => {
  try {
    const hotspotId = req.params.id;
    const hotspot = await DemandHotspot.findById(hotspotId).populate('themeId');
    if (!hotspot) throw new Error('Hotspot not found');
    res.json({ success: true, data: hotspot });
  } catch (error: any) {
    res.status(404).json({ success: false, error: { message: error.message } });
  }
};
