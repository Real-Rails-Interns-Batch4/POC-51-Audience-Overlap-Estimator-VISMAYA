# Verification & Analytical Report (VAR)

This report details the verification checks, mathematical formulas, and live validation results for **POC 51 – Audience Overlap Estimator**.

---

## 1. Data Layer Seeding Verification

To model realistic advertising cohorts, the seeding engine in [seed.py](file:///c:/Users/USER/Documents/POC-51-Audience-Overlap-Estimator-VISMAYA/backend/app/db/seed.py) creates a synthetic universe of 50,000 unique audience member hashes.

- **LinkedIn Cohort Probability**: $P(\text{LinkedIn}) = 0.55$
- **GDELT Cohort Probability**: $P(\text{GDELT}) = 0.70$
- **Geographical Distribution**: Skewed weights: US (45%), EU (30%), APAC (15%), LATAM (10%). Mapped consistently per user hash to ensure regional filters return mathematically aligned intersections.
- **Interest Affinity Mapping**: To mimic real-world professional interests (e.g., software engineers are highly correlated with tech readers), a 75% affinity probability maps professional industry designations directly to GDELT news consumption interest categories.

### Seeding Counts:
- Total unique LinkedIn profiles: **27,483**
- Total unique GDELT consumers: **34,994**
- Overlap (intersection) size of raw cohorts: **19,257**
- Joint union size: **43,220**

---

## 2. Analytical Core Mechanics

### Set Intersection & Similarity
The [overlap_service.py](file:///c:/Users/USER/Documents/POC-51-Audience-Overlap-Estimator-VISMAYA/backend/app/services/overlap_service.py) constructs SQL statements using Common Table Expressions (CTEs) to isolate target sub-cohorts. The intersection size is calculated using a SQL `INTERSECT` on `audience_hash` values.

- **Jaccard Similarity Index**:
  $$J(A, B) = \frac{|A \cap B|}{|A \cup B|} = \frac{|A \cap B|}{|A| + |B| - |A \cap B|}$$

### Saturation Reach Curves
The [reach_service.py](file:///c:/Users/USER/Documents/POC-51-Audience-Overlap-Estimator-VISMAYA/backend/app/services/reach_service.py) models single-channel reach $R_i$ under budget allocation $c_i$ using an exponential decay curve:
$$R_i(c_i) = N_i \cdot \alpha_i \cdot (1 - e^{-\beta_i \cdot c_i})$$
where:
- $N_i$: Total targeted cohort size.
- $\alpha_i$: Maximum reachable proportion of the cohort (saturation limit: 0.82 for LinkedIn, 0.88 for GDELT).
- $\beta_i$: Decay constant governing curve speed (0.00012 for LinkedIn, 0.00008 for GDELT).

### Deduplicated Combined Reach
When running a combined campaign on both channels, the joint reach is modeled assuming independent exposure probabilities for overlapping cohort members:
$$\text{Reach}_{\text{combined}} = (|A| - |C|) \cdot p_A + (|B| - |C|) \cdot p_B + |C| \cdot (p_A + p_B - p_A \cdot p_B)$$
which simplifies to:
$$\text{Reach}_{\text{combined}} = |A| \cdot p_A + |B| \cdot p_B - |C| \cdot p_A \cdot p_B$$
where:
- $p_A = \alpha_A \cdot (1 - e^{-\beta_A \cdot c_A})$
- $p_B = \alpha_B \cdot (1 - e^{-\beta_B \cdot c_B})$
- $|C| = |A \cap B|$ (overlap size).

---

## 3. Live API Validation Log

The following results were captured by running the verification suite against the live FastAPI server:

### Filter Request payload:
- LinkedIn: `Industry = "Tech"`, `Region = "US"`
- GDELT: `Interest Category = "Technology"`, `Region = "US"`

```json
{
  "linkedin_total": 2432,
  "gdelt_total": 3048,
  "overlap_total": 1327,
  "union_total": 4153,
  "jaccard_similarity": 0.3195
}
```

### Reach Response payload (Allocated: LinkedIn=\$15,000, GDELT=\$10,000):
```json
{
  "current_allocation": {
    "linkedin_reach": 3745.34,
    "gdelt_reach": 3386.8,
    "combined_reach": 6123.17,
    "cost_per_reached_user": 4.0829
  }
}
```
*Verification*: 
- Raw sum of independent platform reach: $3745.34 + 3386.8 = 7132.14$
- Deduplicated combined reach: $6123.17$
- **Redundant budget exposure prevented: 1,008.97 users (14% efficiency gain)**.
