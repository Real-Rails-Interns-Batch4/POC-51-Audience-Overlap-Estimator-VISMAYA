# User Acceptance Testing (UAT) Checklist

Use this checklist to perform verification and validation of **POC 51 – Audience Overlap Estimator** before moving to staging.

---

## 🗄️ 1. Database & Seeding Verification
- [ ] **Check seed execution**: Run `python -m app.db.seed` inside the `/backend` folder. Verify that uvicorn logs show exact records generated (27,483 LinkedIn profiles, 34,994 GDELT profiles, 2 parameters).
- [ ] **Verify `data.db` file creation**: Verify that a binary database file named `data.db` has been created in the `/backend` folder.

---

## 🔌 2. API Endpoints Verification
Start uvicorn on port 8000 and run tests (using the `verify-endpoints.ps1` script or Postman/curl):
- [ ] **`/api/channels` (GET)**: Returns the channels list, targeting parameters (industries, regions, interest categories), and no null values in filter lists.
- [ ] **`/api/overlap` (POST)**: Returns the total cohort counts, union, intersection size, and Jaccard similarity. Test with empty filters to ensure it returns raw universe counts.
- [ ] **`/api/reach` (POST)**: Returns 11 reach curve coordinate points ranging from $0 to $50,000 budget, along with efficiency stats under the current allocation.
- [ ] **`/api/media-plan/export` (POST)**: Initiates file download containing a table of budget allocations and deduplicated reach metrics in CSV format.
- [ ] **`/api/media-plan/sample-data` (GET)**: Initiates file download containing 100 outer-joined rows of stochastically matched profiles.

---

## 🖥️ 3. Frontend Dashboard Shell & Aesthetics
Start Next.js dev server on port 3000 and open a browser window:
- [ ] **Verify styling theme**: Confirm background color is `#030712` (fintech dark mode) with clean slate panel cards, electric blue/green accents, and monospaced numerical readouts.
- [ ] **Check responsiveness**: Shrink the viewport. Check that the layout switches from a multi-column terminal grid to a vertical mobile stack without overflows.
- [ ] **Verify loader states**: Change a targeting dropdown select value. A translucent loading overlay should appear over the charts during calculation and disappear when values return.
- [ ] **Verify error notifications**: Temporarily kill the FastAPI backend server. The UI should display a red connection warning banner prompting you to restart the server and retry.

---

## 📊 4. Interactive Charts & Controls
- [ ] **Venn Diagram tab**:
  - Circle sizes resize dynamically when changing filters (e.g. comparing "Tech" vs "Healthcare" industries).
  - Hovering over individual circle rings shows tooltips with single-channel cohort sizes.
  - Hovering over the central intersection shows overlap sizes and Jaccard similarity values.
- [ ] **Reach Saturation Curves tab**:
  - Plots three curves: LinkedIn (dashed blue), GDELT (dashed emerald), and Combined (thick purple).
  - Hovering over the grid plots a vertical tracking line showing coordinate readouts.
  - Moving budget allocation sliders reposition the blue, green, and purple tracking dots.
- [ ] **Channel Comparison tab**:
  - Displays three distinct channel cards with horizontal progress bars representing cohort penetration.
  - Correctly calculates cost per reached user under current budgets.
  - Shows deduplication waste prevention totals (duplications prevented and budget percentage saved).
- [ ] **Cost Sliders**:
  - Adjusting B2B/LinkedIn and public GDELT budgets recalculates combined reach and cost-per-user in real-time.
  - Displays correct percentage split allocations (e.g., $15k / $10k budget updates split to 60% / 40%).

---

## 💾 5. Utility & Info Actions
- [ ] **Export Media Plan button**: Clicking download fetches and downloads `media_plan.csv`. Confirm that opening the file shows the calculated deduplicated reach stats matching the UI cards.
- [ ] **Download Sample Data button**: Clicking download fetches and downloads `audience_sample.csv`. Confirm that opening the file shows a table containing stochastically matched profile hashes, industries, and categories.
- [ ] **Educational Panels**: Check that the sidebar includes "Why This Matters" and "Who Controls the Rail" panels explaining strategic demand capture and gatekeeper distribution models.
