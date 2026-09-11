import { Dataset, IDataset } from '../../models/Dataset';
import { DataRecord } from '../../models/DataRecord';
import { Types } from 'mongoose';

export class DatasetService {
  async createDataset(data: Partial<IDataset>): Promise<IDataset> {
    const dataset = new Dataset(data);
    return await dataset.save();
  }

  async getAllDatasets(): Promise<IDataset[]> {
    return await Dataset.find().sort({ createdAt: -1 });
  }

  async getDatasetById(id: string): Promise<IDataset | null> {
    return await Dataset.findById(id);
  }

  async getDatasetRecords(datasetId: string, limit: number = 100): Promise<any[]> {
    return await DataRecord.find({ datasetId: new Types.ObjectId(datasetId) }).limit(limit);
  }

  async updateDatasetStatus(id: string, status: IDataset['status'], count: number = 0): Promise<void> {
    await Dataset.findByIdAndUpdate(id, { status, recordCount: count });
  }
}

export const datasetService = new DatasetService();
