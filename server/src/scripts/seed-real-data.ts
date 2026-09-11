import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { datasetService } from '../services/data/DatasetService';
import { DataRecord } from '../models/DataRecord';
import centroid from '@turf/centroid';
import dns from 'dns';

// Fix for ECONNREFUSED _mongodb._tcp DNS blocking on restrictive networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // fallback if any issue
}

const seedRealData = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for Seeding Real Data');

    const rootPath = path.resolve(__dirname, '../../../');
    
    // Helper to process GeoJSON FeatureCollection
    const processGeoJSON = async (filename: string, category: string, datasetName: string) => {
      const filePath = path.join(rootPath, filename);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${filePath}`);
        return;
      }

      console.log(`Processing ${filename}...`);
      const dataset = await datasetService.createDataset({
        name: datasetName,
        description: `Imported from ${filename}`,
        category: category,
        source: 'User Upload',
        publisher: 'Bhubaneswar Open Data',
        datasetVersion: '1.0',
        metadata: { isDemo: false }
      });

      const raw = fs.readFileSync(filePath, 'utf8');
      const geojson = JSON.parse(raw);
      
      const recordsToInsert = [];
      let validCount = 0;

      for (const feature of geojson.features) {
        let centerPoint = null;
        if (feature.geometry.type === 'Point') {
          centerPoint = feature.geometry.coordinates;
        } else {
          try {
            // Compute centroid for Polygon/LineString so we can use $near queries easily
            const ctr = centroid(feature);
            centerPoint = ctr.geometry.coordinates;
          } catch (e) {
            continue; // Skip invalid geometries
          }
        }

        if (!centerPoint) continue;

        // Extract name if available
        const name = feature.properties?.name || feature.properties?.WARD_NAME || feature.properties?.Name || `Record at ${centerPoint[1].toFixed(2)}, ${centerPoint[0].toFixed(2)}`;

        recordsToInsert.push({
          datasetId: dataset._id,
          category: dataset.category,
          entityType: feature.geometry.type,
          name,
          attributes: feature.properties,
          location: {
            type: 'Point',
            coordinates: [centerPoint[0], centerPoint[1]]
          },
          geography: feature.geometry // Save the full geometry for future use
        });
        
        validCount++;
      }

      if (recordsToInsert.length > 0) {
        // Insert in batches of 1000 to avoid memory issues
        const batchSize = 1000;
        for (let i = 0; i < recordsToInsert.length; i += batchSize) {
          await DataRecord.insertMany(recordsToInsert.slice(i, i + batchSize));
        }
      }

      await datasetService.updateDatasetStatus(dataset._id.toString(), 'COMPLETED', validCount);
      console.log(`✅ Processed ${validCount} records for ${filename}`);
    };

    // 1. Process OSM Amenities
    await processGeoJSON('osm-amenities.geojson', 'INFRASTRUCTURE', 'OSM Amenities');
    
    // 2. Process OSM Power
    await processGeoJSON('osm-power.geojson', 'INFRASTRUCTURE', 'OSM Power');
    
    // 3. Process OSM Roads
    await processGeoJSON('osm-roads.geojson', 'TRANSPORT', 'OSM Roads');

    // 4. Process Wards
    await processGeoJSON('wards.geojson', 'DEMOGRAPHICS', 'Bhubaneswar Wards');

    // 5. Process Police Jurisdiction
    await processGeoJSON('police_jurisdiction.geojson', 'INFRASTRUCTURE', 'Police Jurisdiction');

    // 6. Process BDA Boundary
    await processGeoJSON('bda_boundary.geojson', 'DEVELOPMENT', 'BDA Boundary');

    // 7. Process BMC Boundary
    await processGeoJSON('bmc-boundary.geojson', 'DEVELOPMENT', 'BMC Boundary');

    console.log('🎉 All real datasets seeded successfully.');

  } catch (error) {
    console.error('❌ Failed to seed real data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedRealData();
