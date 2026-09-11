# Civic Pulse

"Consolidating the Voice of the Many into the Decisions of the Few."

Civic Pulse is a civic intelligence and constituency development planning platform built for PARAKRAM 1.0 (Problem Statement ID: PK01PS002).

## Project Purpose
Civic Pulse transforms collective citizen demand into evidence-backed development priorities. Rather than a complaint-resolution system, it aims to aggregate citizen input, combine it with demographics and public data, and output optimized, constraint-aware development proposals for public authorities.

## Architecture & Stack
This repository is structured as a monorepo containing:
- **Client**: React, TypeScript, Vite, Tailwind CSS, TanStack Query.
- **Server**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT Auth.

## Phase 0 Foundation
Currently, this project implements **Phase 0**. 
Phase 0 establishes a robust, secure foundation including authentication (OTP & JWT), RBAC (Citizen vs Authority), and shell applications. 
*Note: AI classification, demand clustering, proposals, and hotspot features belong to Phase 1+ and are deliberately excluded in Phase 0.*

## Setup & Running

### Environment Variables
Copy the `.env.example` file to `.env` in the root and fill in the values:
```bash
cp .env.example .env
```
Ensure a MongoDB instance is running at `MONGODB_URI`.

### Installation
From the root directory, install all dependencies for both client and server:
```bash
npm install
```

### Running Locally
To run both the frontend and backend concurrently:
```bash
npm run dev
```
- Frontend will be available at `http://localhost:5173`
- Backend API will be available at `http://localhost:4000`

### Testing & Linting
```bash
npm run test
npm run lint
npm run typecheck
```

## Documentation
For more detailed information, see the `docs/` folder:
- [Architecture](docs/architecture.md)
- [Phase 0 Specifications](docs/phase-0.md)
- [Security](docs/security.md)
- [Roadmap](docs/roadmap.md)
