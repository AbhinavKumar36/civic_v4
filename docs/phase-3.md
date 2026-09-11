# Phase 3: Data Fusion & Contextual Grounding

## Objective
To build a contextual evidence layer that connects Citizen Demands and Hotspots with public/contextual datasets to provide Evidence-backed Civic Context. This layer strictly avoids prioritizing projects or making budget decisions.

## Architecture & Data Models

### 1. `Dataset`
Represents the metadata and provenance of a public dataset (e.g., School Infrastructure Survey).
- Provides traceability: Who published it? Where did it come from? When was it imported?

### 2. `DataRecord`
Normalized representation of individual records within a `Dataset`. 
- Leverages GeoJSON for 2dsphere location indexing.
- Uses flexible attributes based on the schema mapping defined at ingestion.

### 3. `EvidenceRecord`
Connects a `NormalizedDemand` or `DemandHotspot` to multiple `DataRecord`s.
- Contains the `evidenceType` (`SUPPORTING`, `CONTRADICTING`, `NEUTRAL`, `INSUFFICIENT_DATA`).
- Stores calculated indicators (e.g., "Nearby facilities count").
- Contains an AI-generated deterministic interpretation that strictly relies on documented numbers to reconcile citizen perception with actual data.

## Services

1. **DatasetIngestionService**: Handles importing raw datasets, validating geospatial coordinates, and normalizing raw attributes into canonical names.
2. **GeoContextService**: Uses MongoDB `$near` queries to find contextual records around a citizen's location or a hotspot.
3. **EvidenceService**: The fusion engine. Calculates basic indicators and uses Gemini to map the mathematical relationship into human-readable interpretations without fabricating data.

## APIs
- `GET /api/v1/datasets` - Lists all datasets.
- `GET /api/v1/datasets/:id` - Gets dataset details and sample records.
- `GET /api/v1/evidence/demand/:id` - Gets the generated evidence for a specific demand.
- `POST /api/v1/evidence/demand/:id/generate` - Triggers the EvidenceService fusion for a demand.

## Frontend Updates
- **Hotspots Map Layer**: Added capabilities to toggle datasets (e.g., Schools, Hospitals) directly on the Leaflet map over the demand hotspots.
- **Evidence Context View**: An interface available to Authorities that displays the original citizen report alongside the documented evidence and the AI reconciliation.

## Limitations
- Datasets are currently bulk-imported through a seed script. Dynamic CSV/JSON uploads via the UI can be added in later phases.
- Indicators are currently simple counts and distances. Complex indicators (e.g. population per classroom) require more specific calculations tied to dataset types.

## Future Phases
Phase 4 will ingest these EvidenceRecords to generate actual Priority Scores based on constraints.
