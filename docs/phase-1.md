# Phase 1: Civic Input Intelligence

## Overview
Phase 1 focuses exclusively on processing raw citizen inputs and transforming them into structured, actionable intelligence using AI (Gemini). It does **not** implement aggregation, clustering, or geographic hotspot detection (reserved for Phase 2).

## Domain Models
1. **CivicInput**: The raw citizen submission. Tracks input modality (TEXT, VOICE, IMAGE), location (GeoJSON), language, and processing lifecycle status (`RECEIVED`, `PROCESSING`, `NORMALIZED`, `FAILED`).
2. **NormalizedDemand**: The structured AI interpretation. Maps the raw input into a constrained category taxonomy (e.g., `ROADS_AND_TRANSPORT`), identifies severity, urgency, demand statement, problem statement, and AI confidence.

## Ingestion Pipeline
1. Citizen composes an input using the `CivicInputComposer`. They can type, speak (via Web Speech API), or upload photos.
2. The payload is sent to `POST /api/v1/civic-inputs`.
3. The server validates the input, saves images locally (securely), and persists a `CivicInput`.
4. The `NormalizationService` is triggered asynchronously.
5. `GeminiProvider` analyzes the raw inputs (and images) against a strict JSON schema prompt.
6. The resulting structured JSON is saved as a `NormalizedDemand`.

## Multimodal Flow
- **Images**: Validated by Multer, converted to base64, and sent to Gemini-2.5-pro alongside the text prompt.
- **Voice**: Transcribed client-side via Web Speech API; the transcript is sent as text.

## Confidence
The `confidence` field in `NormalizedDemand` represents the AI's certainty in its *interpretation* of the text, **not** the objective truth of the report.

## Security
- Multer enforces file size constraints (5MB) and strictly checks mime types.
- RBAC ensures citizens only view their own history.
- API Keys are strictly validated by Zod at startup.
