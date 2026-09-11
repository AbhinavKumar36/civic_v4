# Phase 0 Specifications

This document explicitly defines the boundaries for **Phase 0** of Civic Pulse development.

## What is INCLUDED
- **Monorepo setup**: Client and Server separation using npm workspaces.
- **Backend structure**: Node.js/Express scaffolding.
- **Database foundation**: MongoDB setup with Mongoose connection, retry logic, and base models.
- **Authentication**: TextBee OTP integration (abstracted/mocked) and JWT generation/refresh flow.
- **RBAC**: Core roles (`CITIZEN`, `AUTHORITY`, `ADMIN`) and protected routes.
- **Frontend structure**: Vite React application.
- **Design System**: Tailored React components using Tailwind CSS.
- **Placeholders**: UI shells for `/citizen` and `/authority` paths, backend service abstractions for AI and Geo.

## What is EXCLUDED (Phase 1+)
DO NOT IMPLEMENT the following in Phase 0:
- AI intelligence, classification, or embeddings.
- Spatial/Geo processing, demand clustering, hotspots, heatmaps.
- Data fusion with public datasets (e.g., OpenWeatherMap, demographics).
- Social/Economic impact prediction and portfolio optimization.
- Proposal scoring or Authority Decision workflows.
