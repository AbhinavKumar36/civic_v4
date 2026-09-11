import { DataRecord } from '../../models/DataRecord';

export class GeoContextService {
  /**
   * Finds DataRecords near a specific geographic point.
   * @param lon Longitude
   * @param lat Latitude
   * @param radiusMeters Search radius in meters
   * @param category Optional filter by Dataset category (e.g., EDUCATION)
   */
  async findNearbyRecords(lon: number, lat: number, radiusMeters: number, category?: string) {
    const query: any = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          },
          $maxDistance: radiusMeters
        }
      }
    };

    if (category) {
      query.category = category;
    }

    return await DataRecord.find(query).populate('datasetId');
  }
}

export const geoContextService = new GeoContextService();
