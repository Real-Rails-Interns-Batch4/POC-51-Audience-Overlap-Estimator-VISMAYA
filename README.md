# POC 51 – Audience Overlap Estimator

An analytical advertising media planning tool developed under the **Distribution & Demand** rail. This application stochastically models professional cohorts (LinkedIn) and public media consumption interest panels (GDELT) to calculate audience overlap, plot saturation reach curves, and deduplicate joint campaign reach in real-time.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS (v4), shadcn/ui, D3.js
- **Backend**: FastAPI, Pandas, DuckDB, Pydantic
- **Database**: DuckDB (local columnar database)

---

## 📐 Architecture & Data Flow

```
[Next.js Client] ──(HTTP JSON)──> [FastAPI Server] ──(SQL/Pandas)──> [DuckDB (data.db)]
```

1. **Seeding**: The backend seeds a local DuckDB file (`data.db`) with a stochastically generated user universe of 50,000 profiles. The user attributes correlate stochastically (e.g., region consistency and 75% industry-to-category interest affinity).
2. **Filtering**: Planners select cohort characteristics (B2B industries/regions on LinkedIn and public interest categories/regions on GDELT).
3. **Analytics**: 
   - **Overlap**: Calculates set intersection size using SQL `INTERSECT` inside DuckDB.
   - **Reach**: Generates exponential saturation curves and computes joint deduplicated reach using independent exposure probabilities:
     $$\text{Reach}_{\text{combined}} = |A| \cdot p_A + |B| \cdot p_B - |C| \cdot p_A \cdot p_B$$
4. **Visualizations**: Interactive D3.js Venn Diagrams and Reach Curves switchable via tabs.

---

## ⚙️ Setup & Installation

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .\.venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   ```bash
   copy .env.example .env
   ```
5. Seed the database with mock audience panels:
   ```bash
   python -m app.db.seed
   ```
6. Run the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **`http://localhost:3000`**.

---

## 📋 Features

1. **Audience Overlap Diagram**: Interactive D3 Venn diagram showing LinkedIn and GDELT segment circles. The circles resize proportionally and slide closer together based on Jaccard similarity.
2. **Saturation Reach Curves**: Dynamic D3 line chart plotting single-channel reach and combined deduplicated reach curves. Includes mouse tracking gridlines and allocation coordinates indicators.
3. **Channel Comparison**: Detailed metrics card detailing B2B and public stream reach, individual channel efficiency, and total deduplication savings.
4. **Cost Sliders**: Drag-and-drop budget allocation sliders showing total spent proportions in real-time.
5. **Media Plan Exporter**: One-click download of the deduplicated media plan split details as a CSV file.
6. **Download Sample Data**: Streams a raw full-outer-joined sample (100 rows) of audience profiles from DuckDB.
7. **Educational Panels**: Incorporates strategic copy explaining "Why This Matters" and "Who Controls the Rail" networks.
