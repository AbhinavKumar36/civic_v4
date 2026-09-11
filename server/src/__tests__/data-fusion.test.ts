import { datasetService } from '../services/data/DatasetService';
import { datasetIngestionService } from '../services/data/DatasetIngestionService';
import { geoContextService } from '../services/data/GeoContextService';
import { evidenceService } from '../services/intelligence/EvidenceService';
import { Dataset } from '../models/Dataset';
import { DataRecord } from '../models/DataRecord';
import mongoose from 'mongoose';

// Since we mock transformers globally, we just mock the DB responses here for service logic testing
describe('Phase 3: Data Fusion & Contextual Grounding', () => {
  beforeAll(async () => {
    // We would typically connect to an in-memory Mongo server here.
    // Since this is a lightweight unit test suite without a real DB running in this environment, 
    // we'll mock Mongoose models directly.
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('DatasetIngestionService', () => {
    it('should correctly normalize and validate raw json data', async () => {
      const mockDataset = { _id: new mongoose.Types.ObjectId(), category: 'EDUCATION', name: 'Mock' };
      
      jest.spyOn(datasetService, 'updateDatasetStatus').mockResolvedValue(undefined);
      jest.spyOn(datasetService, 'getDatasetById').mockResolvedValue(mockDataset as any);
      
      const insertSpy = jest.spyOn(DataRecord, 'insertMany').mockResolvedValue([] as any);

      const rawData = [
        { lat: 20.1, lon: 85.1, student_count: 50 }, // valid
        { lat: 'invalid', lon: 85.1, student_count: 50 }, // invalid coord
        { student_count: 10 } // missing coords
      ];

      const schemaMapping = { latitude: 'lat', longitude: 'lon', studentEnrollment: 'student_count' };
      
      const result = await datasetIngestionService.ingestData(mockDataset._id.toString(), rawData, schemaMapping);
      
      expect(result.totalProcessed).toBe(3);
      expect(result.validInserted).toBe(1);
      expect(result.invalidSkipped).toBe(2);

      // Verify the normalization
      const insertedDoc = (insertSpy.mock.calls[0][0] as any)[0];
      expect(insertedDoc.location.coordinates).toEqual([85.1, 20.1]); // GeoJSON is [lon, lat]
      expect(insertedDoc.attributes.studentEnrollment).toBe(50);
    });
  });

  describe('GeoContextService', () => {
    it('should construct a valid $geoNear query', async () => {
      const findSpy = jest.spyOn(DataRecord, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      } as any);

      await geoContextService.findNearbyRecords(85.1, 20.1, 2000, 'EDUCATION');

      expect(findSpy).toHaveBeenCalledWith({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [85.1, 20.1] },
            $maxDistance: 2000
          }
        },
        category: 'EDUCATION'
      });
    });
  });

});
