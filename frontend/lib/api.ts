const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface LinkedInFilters {
  industries?: string[];
  regions?: string[];
}

export interface GDELTFilters {
  categories?: string[];
  regions?: string[];
}

export interface BudgetAllocation {
  linkedin: number;
  gdelt: number;
}

export async function fetchChannels() {
  const url = `${BASE_URL}/api/channels`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error(`[API Error] Failed to fetch channels from ${url}:`, err);
    throw new Error(`Failed to fetch channels from backend at ${url}. ${err.message || err}`);
  }
}

export async function fetchOverlap(linkedinFilters: LinkedInFilters, gdeltFilters: GDELTFilters) {
  const url = `${BASE_URL}/api/overlap`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        linkedin_filters: linkedinFilters,
        gdelt_filters: gdeltFilters,
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error(`[API Error] Failed to fetch overlap metrics from ${url}:`, err);
    throw new Error(`Failed to fetch overlap metrics. ${err.message || err}`);
  }
}

export async function fetchReach(
  linkedinFilters: LinkedInFilters,
  gdeltFilters: GDELTFilters,
  budgetAllocation: BudgetAllocation
) {
  const url = `${BASE_URL}/api/reach`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        linkedin_filters: linkedinFilters,
        gdelt_filters: gdeltFilters,
        budget_allocation: budgetAllocation,
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error(`[API Error] Failed to fetch reach metrics from ${url}:`, err);
    throw new Error(`Failed to fetch reach metrics. ${err.message || err}`);
  }
}

export async function downloadMediaPlan(
  linkedinFilters: LinkedInFilters,
  gdeltFilters: GDELTFilters,
  budgetAllocation: BudgetAllocation
) {
  const url = `${BASE_URL}/api/media-plan/export`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        linkedin_filters: linkedinFilters,
        gdelt_filters: gdeltFilters,
        budget_allocation: budgetAllocation,
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'media_plan.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err: any) {
    console.error(`[API Error] Failed to export media plan from ${url}:`, err);
    throw new Error(`Failed to export media plan. ${err.message || err}`);
  }
}

export async function downloadSampleData() {
  const url = `${BASE_URL}/api/sample-data`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'audience_sample.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err: any) {
    console.error(`[API Error] Failed to download sample data from ${url}:`, err);
    throw new Error(`Failed to download sample data. ${err.message || err}`);
  }
}
