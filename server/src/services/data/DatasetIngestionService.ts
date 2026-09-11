import { datasetService } from './DatasetService';
import { DataRecord } from '../../models/DataRecord';
import { Types } from 'mongoose';

export class DatasetIngestionService {
  
  /**
   * Imports a raw dataset (JSON array) into DataRecords
   * @param datasetId The ID of the registered Dataset
   * @param records Array of raw records
   * @param schemaMapping A simple mapping of raw fields to canonical fields
   */
  async ingestData(datasetId: string, records: any[], schemaMapping: Record<string, string>) {
    try {
      await datasetService.updateDatasetStatus(datasetId, 'PROCESSING');

      const dataset = await datasetService.getDatasetById(datasetId);
      if (!dataset) throw new Error('Dataset not found');

      let validCount = 0;
      const dataRecordsToInsert = [];

      for (const raw of records) {
        // Validation: Must have coordinates to be useful
        const lat = raw[schemaMapping['latitude'] || 'lat'];
        const lon = raw[schemaMapping['longitude'] || 'lon'];
        
        if (!lat || !lon || isNaN(Number(lat)) || isNaN(Number(lon))) {
          continue; // Skip invalid geographic records
        }

        // Schema normalization
        const attributes: Record<string, any> = {};
        for (const [key, val] of Object.entries(raw)) {
          // If there's a mapping, use canonical name, else keep raw name
          const canonicalKey = Object.keys(schemaMapping).find(k => schemaMapping[k] === key) || key;
          
          // Skip mapped lat/lon from attributes
          if (canonicalKey !== 'latitude' && canonicalKey !== 'longitude' && canonicalKey !== 'name') {
            attributes[canonicalKey] = val;
          }
        }

        const nameFieldRaw = raw[schemaMapping['name'] || 'name'];
        const name = nameFieldRaw ? String(nameFieldRaw) : `Record at ${lat}, ${lon}`;

        dataRecordsToInsert.push({
          datasetId: dataset._id,
          category: dataset.category,
          entityType: dataset.category, // Simplification for demo
          name,
          attributes,
          location: {
            type: 'Point',
            coordinates: [Number(lon), Number(lat)] // GeoJSON is [longitude, latitude]
          }
        });
        
        validCount++;
      }

      // Batch insert
      if (dataRecordsToInsert.length > 0) {
        await DataRecord.insertMany(dataRecordsToInsert);
      }

      await datasetService.updateDatasetStatus(datasetId, 'COMPLETED', validCount);
      
      return {
        totalProcessed: records.length,
        validInserted: validCount,
        invalidSkipped: records.length - validCount
      };

    } catch (error) {
      console.error('[DatasetIngestionService] Failed to ingest data:', error);
      await datasetService.updateDatasetStatus(datasetId, 'FAILED');
      throw error;
    }
  }
}

export const datasetIngestionService = new DatasetIngestionService();
