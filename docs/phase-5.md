# Phase 5 — Social & Economic Impact Engine

## 1. Overview

The **Social & Economic Impact Engine** estimates potential welfare and economic returns of candidate development proposals, pairing every prediction with explicit **uncertainty tiers, confidence ratings, and model assumptions**.

> [!IMPORTANT]
> **No False Precision Rule**: Civic Pulse strictly avoids fabricating monetary estimates (e.g. "₹4.27 Crore generated") when empirical econometric micro-data is unavailable. Dimensions without verified indicators are marked `NOT_AVAILABLE`.

---

## 2. Social Impact Dimensions (0–100)

Social impact is evaluated across 6 core citizen-welfare dimensions:

1. **Beneficiary Reach (25% Weight)**: Direct catchment size scaled against ward demographic attributes.
2. **Accessibility Improvement (20% Weight)**: Reduction in spatial barriers to clinics, schools, and water mains based on nearest-facility density.
3. **Service Coverage Expansion (20% Weight)**: Municipal utility perimeter expansion over underserved areas.
4. **Equity & Inclusion (15% Weight)**: Targeted upliftment of vulnerable groups (slum pockets, women, infants, elderly).
5. **Quality of Life Potential (10% Weight)**: Alleviation of high-urgency civic pain points (flooding, potable water deficits).
6. **Vulnerable Population Benefit (10% Weight)**: Direct infrastructure dedicated to marginalized demographic segments.

$$\text{Social Impact Score} = \sum (\text{Dimension Score} \times \text{Weight})$$

---

## 3. Economic Impact Valuation

Calculated only where empirical project parameters and municipal categories permit:

- **Direct Economic Beneficiary Reach**: Count of economic agents benefiting from facility.
- **Local Employment Potential**: Direct civil construction and operational employment potential derived from capital outlay.
- **Travel-Time Savings**: Transit delay and congestion mitigation (applicable to `ROADS`, `TRANSPORT`, `DRAINAGE`).
- **Productivity Multiplier**: Health and educational retention boosts to workforce productivity.
- **Local Market & Commercial Footfall**: Stimulation of commercial and retail micro-corridors.
- **Municipal Service Delivery Efficiency**: Reduction in recurring emergency maintenance expenditure (`DRAINAGE`, `WATER`, `SANITATION`).

---

## 4. Catchment Scenario Modeling

Every proposal includes 3 transparent demographic scenarios:

1. **Conservative**: Focuses strictly on immediate primary catchment (~70% of baseline).
2. **Baseline**: Projected normal operating capacity based on ward demographic attributes.
3. **Optimistic**: Accounts for inter-ward regional spillover and adjacent transit footfall (~135% of baseline).

---

## 5. Confidence, Uncertainty & Assumptions

- **Confidence Score ($0.00 - 1.00$)**:
  Derived from the volume of primary evidence records, recency of public datasets, and demographic availability.
- **Uncertainty Rating (`LOW` | `MEDIUM` | `HIGH`)**:
  - `LOW`: Corroborated by multiple real spatial layers (OSM, Wards, Demographics).
  - `MEDIUM`: Partial datasets present (e.g. facility counts known, capacity unmeasured).
  - `HIGH`: Baseline demographic or primary evidence absent.
- **Assumptions Tracking**:
  Explicitly documents utility radius limits, occupancy ramp-up windows, and municipal execution factors.

---

## 6. API Endpoints

- `POST /api/v1/proposals/:id/impact` — Compute or update impact assessment
- `GET /api/v1/proposals/:id/impact` — Retrieve impact assessment
- `GET /api/v1/proposals/:id/analysis` — Retrieve integrated priority & impact intelligence
