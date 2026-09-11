import mongoose from 'mongoose';
import { env } from '../config/env';
import { datasetService } from '../services/data/DatasetService';
import { datasetIngestionService } from '../services/data/DatasetIngestionService';
import dns from 'dns';

// Fix for ECONNREFUSED _mongodb._tcp DNS blocking on restrictive networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // fallback if any issue
}

const seedBhubaneswarData = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for Seeding Contextual Data');

    // 1. Create a Seed Dataset for Education
    const educationDataset = await datasetService.createDataset({
      name: 'Bhubaneswar School Infrastructure (DEMO)',
      description: 'DEMO DATA: A seed dataset containing sample school locations and infrastructure metrics in Bhubaneswar.',
      category: 'EDUCATION',
      source: 'Civic Pulse Demo Data Generator',
      publisher: 'Mock Gov Data',
      datasetVersion: '2026.1',
      metadata: { isDemo: true }
    });

    console.log(`Created Dataset: ${educationDataset.name}`);

    // Mock records around Bhubaneswar (approx lat: 20.296, lon: 85.824)
    const mockSchoolRecords = [
      {
        name: 'Govt High School, Unit-1',
        lat: 20.280,
        lon: 85.830,
        enrollment: 430,
        classrooms: 8,
        toilets: 4,
        status: 'Operational'
      },
      {
        name: 'Capital High School',
        lat: 20.260,
        lon: 85.820,
        enrollment: 850,
        classrooms: 15,
        toilets: 10,
        status: 'Operational'
      },
      {
        name: 'Old Town Primary',
        lat: 20.240,
        lon: 85.835,
        enrollment: 120,
        classrooms: 3,
        toilets: 1,
        status: 'Needs Repair'
      }
    ];

    // Map the fields
    const schemaMapping = {
      latitude: 'lat',
      longitude: 'lon',
      name: 'name',
      studentEnrollment: 'enrollment',
      classroomCount: 'classrooms'
    };

    const result = await datasetIngestionService.ingestData(educationDataset._id.toString(), mockSchoolRecords, schemaMapping);
    
    console.log('Ingestion Result:', result);
    console.log('✅ Phase 3 Seed Data successfully generated.');

  } catch (error) {
    console.error('❌ Failed to seed data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedBhubaneswarData();
