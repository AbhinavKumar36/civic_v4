# Phase 4 — Proposal Evaluation & Priority Engine

## 1. Product Overview

The **Proposal Evaluation & Priority Engine** establishes an objective, transparent, and auditable framework for comparing municipal development proposals against empirical citizen demand and public data.

> [!IMPORTANT]
> **Decision-Support Guarantee**: Civic Pulse does NOT make autonomous governmental decisions. It equips municipal authorities with auditable scoring, raw data provenance, and explainable priority indicators to inform democratic budget and project allocations.

---

## 2. Development Proposal Model

Development proposals represent candidate capital works projects evaluated by urban local bodies.

### Model Schema (`DevelopmentProposal`)
- **`title`**: Descriptive project title
- **`description`**: Project scope, catchment goals, and objectives
- **`category`**: 12 standardized civic categories:
  `HEALTHCARE`, `EDUCATION`, `WATER`, `SANITATION`, `ROADS`, `TRANSPORT`, `DRAINAGE`, `HOUSING`, `ENVIRONMENT`, `PUBLIC_SAFETY`, `DIGITAL_INFRASTRUCTURE`, `OTHER`
- **`subCategory`**: Specific project sub-classification
- **`location`**: GeoJSON Point coordinates `[longitude, latitude]` (indexed with `2dsphere`)
- **`wardId`**: Target municipal ward (e.g. `Ward 35`, `Ward 42`)
- **`estimatedCost`**: Estimated financial outlay in INR (₹)
- **`estimatedTimeline`**: Projected execution duration (e.g. `10 months`)
- **`beneficiaries`**: Target demographic reach
- **`targetGroups`**: Designated vulnerable/priority populations
- **`dependencies`**: Inter-agency statutory or technical prerequisites
- **`source`**: Originating channel (`DEMO_PROPOSAL`, `CITIZEN_INITIATIVE`, `WARD_COUNCIL`)
- **`status`**: `DRAFT` | `UNDER_REVIEW` | `EVALUATED` | `APPROVED` | `REJECTED`

---

## 3. The 11 Priority Factors & Scoring Methodology

All priority dimensions are normalized to a **0–100 scale** before computing the weighted total score. Every factor records its `rawValue`, `normalizedValue`, `weight`, and mathematical `contribution` (+points).

$$\text{Priority Score} = \sum_{i=1}^{11} (\text{Normalized Factor}_i \times \text{Weight}_i)$$

### Dimension Breakdown & Default Weights

| # | Dimension | Default Weight | Raw Input Metric | Normalization Formula (0–100) |
|---|---|:---:|---|---|
| 1 | **Demand Strength** | 15% (0.15) | Total citizen submissions | $\min(100, \frac{\text{submissions}}{40} \times 100)$ |
| 2 | **Unique Citizen Reach** | 15% (0.15) | Distinct verified citizens | $\min(100, \frac{\text{unique\_citizens}}{30} \times 100)$ |
| 3 | **Demand Recurrence** | 10% (0.10) | Observation window status | `RECURRING` = 90, `EMERGING` = 65, `ISOLATED` = 40 |
| 4 | **Geographic Concentration** | 10% (0.10) | Hotspot count & intensity | $\min(100, \max(30, \text{avgIntensity} \times 85))$ |
| 5 | **Contextual Evidence** | 15% (0.15) | Supporting vs contradicting | $\text{clamp}(0, 100, \frac{100\cdot S + 50\cdot N + 25\cdot I - 50\cdot C}{\text{total}})$ |
| 6 | **Infrastructure Gap** | 10% (0.10) | Existing facilities in 5km | 0 facilities = 90, $\le 2$ = 75, $\le 5$ = 50, $> 5$ = 25 |
| 7 | **Citizen Urgency** | 5% (0.05) | Demands urgency tier | `LOW`=25, `MEDIUM`=50, `HIGH`=75, `CRITICAL`=100 |
| 8 | **Impact Severity** | 5% (0.05) | Demands severity tier | `LOW`=25, `MEDIUM`=50, `HIGH`=75, `CRITICAL`=100 |
| 9 | **Affected Population** | 5% (0.05) | Catchment / Ward population | $\min(100, \frac{\text{residents}}{30000} \times 100)$ |
| 10 | **Equity & Vulnerability** | 5% (0.05) | Slum pockets / target groups | $35 + 15 \times \text{groups} + 25 \times \text{slumPresence}$ |
| 11 | **Evidence Confidence** | 5% (0.05) | Mean dataset confidence | $\min(100, \text{meanConfidence} \times 10)$ |

*Note: The weighting methodology is a prototype decision-support framework and is not a government-approved policy formula. Weights are fully configurable.*

---

## 4. Deterministic Reproducibility

The scoring engine is strictly **deterministic**:
- Evaluating the same proposal and underlying datasets twice produces **identical total scores and factor contributions**.
- AI models (Gemini) are strictly prohibited from modifying numerical values or generating unverified scores; they are utilized solely for formatting structured summaries.

---

## 5. Explainability Architecture

Every evaluated proposal generates:
1. **Top Positive Drivers**: The top 3 dimensions contributing the highest points to the score.
2. **Score Limitations**: Factors scoring $< 50/100$ or missing demographic/capacity datasets.
3. **Auditable Lineage**:
$$\text{Proposal} \rightarrow \text{Civic Demands} \rightarrow \text{Themes / Hotspots} \rightarrow \text{Evidence Records} \rightarrow \text{Public Datasets} \rightarrow \text{Source Files}$$

---

## 6. API Endpoints

- `POST /api/v1/proposals` — Create development proposal
- `GET /api/v1/proposals` — List and filter proposals by category/ward/rank
- `GET /api/v1/proposals/:id` — Proposal detail
- `POST /api/v1/proposals/:id/evaluate` — Run priority evaluation
- `POST /api/v1/proposals/evaluate-all` — Batch evaluate and rank all proposals
- `GET /api/v1/proposals/:id/analysis` — Complete unified analysis
