# Architecture Overview

Civic Pulse is designed as a pipeline for turning raw citizen input into optimized development portfolios.

## Future Intelligence Pipeline

The intended flow for the system is:
1. **Citizen Voice**: Multilingual/multimodal intake.
2. **Civic Demand**: Normalization of requests.
3. **Evidence**: Demand hotspots combined with public datasets.
4. **Priority**: Automated scoring.
5. **Impact**: Prediction models.
6. **Action**: Portfolio optimization for Authority Decision.

## System Components

### Frontend (Client)
A React SPA providing distinct shells:
- **Citizen Shell**: Submission and tracking of input.
- **Authority Shell**: Decision-support dashboard.

### Backend (Server)
A Node/Express API with modular architecture:
- `auth`: OTP and session handling.
- `users`: User profiling and roles.
- *(FUTURE)* `civic-inputs`: Multimodal ingestion.
- *(FUTURE)* `themes`: AI classification.
- *(FUTURE)* `hotspots`: Geo-spatial clustering.

### Database (MongoDB)
All models reside in MongoDB, taking advantage of `2dsphere` geospatial indexing for future hotspot detection.

## External Services
- **TextBee**: For delivering OTP SMS securely.
- **Gemini API (Future)**: For NLP and thematic intelligence.
- **OpenWeatherMap (Future)**: Contextual environmental data.
