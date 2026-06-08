const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const res = await fetch(`${BASE_URL}/api/channels`);
  if (!res.ok) {
    throw new Error(`Failed to fetch channels: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchOverlap(linkedinFilters: LinkedInFilters, gdeltFilters: GDELTFilters) {
  const res = await fetch(`${BASE_URL}/api/overlap`, {
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
    throw new Error(`Failed to fetch overlap metrics: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchReach(
  linkedinFilters: LinkedInFilters,
  gdeltFilters: GDELTFilters,
  budgetAllocation: BudgetAllocation
) {
  const res = await fetch(`${BASE_URL}/api/reach`, {
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
    throw new Error(`Failed to fetch reach metrics: ${res.statusText}`);
  }
  return res.json();
}

export async function downloadMediaPlan(
  linkedinFilters: LinkedInFilters,
  gdeltFilters: GDELTFilters,
  budgetAllocation: BudgetAllocation
) {
  const res = await fetch(`${BASE_URL}/api/media-plan/export`, {
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
    throw new Error(`Failed to export media plan: ${res.statusText}`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'media_plan.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadSampleData() {
  const res = await fetch(`${BASE_URL}/api/media-plan/sample-data`);
  if (!res.ok) {
    throw new Error(`Failed to download sample data: ${res.statusText}`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audience_sample.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
