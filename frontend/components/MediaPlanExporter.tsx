import React from "react";
import { downloadMediaPlan, downloadSampleData } from "../lib/api";

interface MediaPlanExporterProps {
  linkedinFilters: any;
  gdeltFilters: any;
  budgetAllocation: any;
}

export function MediaPlanExporter({
  linkedinFilters,
  gdeltFilters,
  budgetAllocation,
}: MediaPlanExporterProps) {
  const [exportingPlan, setExportingPlan] = React.useState(false);
  const [downloadingSample, setDownloadingSample] = React.useState(false);

  const handleExportPlan = async () => {
    try {
      setExportingPlan(true);
      await downloadMediaPlan(linkedinFilters, gdeltFilters, budgetAllocation);
    } catch (err) {
      console.error(err);
      alert("Failed to export media plan");
    } finally {
      setExportingPlan(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      setDownloadingSample(true);
      await downloadSampleData();
    } catch (err) {
      console.error(err);
      alert("Failed to download sample data");
    } finally {
      setDownloadingSample(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownloadSample}
        disabled={downloadingSample}
        className="cursor-pointer rounded border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
      >
        {downloadingSample ? "Downloading..." : "Download Sample Data"}
      </button>
      <button
        onClick={handleExportPlan}
        disabled={exportingPlan}
        className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-900/20 transition hover:bg-blue-500 disabled:opacity-50"
      >
        {exportingPlan ? "Generating..." : "Export Media Plan"}
      </button>
    </div>
  );
}
export default MediaPlanExporter;
