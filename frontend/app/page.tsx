"use client";

import React, { useEffect, useState } from "react";
import {
  fetchChannels,
  fetchOverlap,
  fetchReach,
  LinkedInFilters,
  GDELTFilters,
} from "../lib/api";
import AudienceSelector from "../components/AudienceSelector";
import CostSliders from "../components/CostSliders";
import WhyThisMatters from "../components/WhyThisMatters";
import WhoControlsTheRail from "../components/WhoControlsTheRail";
import MediaPlanExporter from "../components/MediaPlanExporter";
import VennDiagram from "../components/charts/VennDiagram";
import ReachCurveChart from "../components/charts/ReachCurveChart";
import ChannelComparison from "../components/charts/ChannelComparison";

type TabType = "overlap" | "reach" | "comparison";

export default function Dashboard() {
  // 1. App Load / Metadata State
  const [channels, setChannels] = useState<any>(null);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [channelsError, setChannelsError] = useState<string | null>(null);

  // 2. Active Tab State
  const [activeTab, setActiveTab] = useState<TabType>("overlap");

  // 3. User Input / Targeting State
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedLiRegion, setSelectedLiRegion] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedGdeltRegion, setSelectedGdeltRegion] = useState<string>("");

  // 4. Budget State
  const [linkedinBudget, setLinkedinBudget] = useState<number>(15000);
  const [gdeltBudget, setGdeltBudget] = useState<number>(10000);

  // 5. API Response Analytics State
  const [overlapData, setOverlapData] = useState<any>(null);
  const [reachData, setReachData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Load channels configuration on mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        setLoadingChannels(true);
        const data = await fetchChannels();
        setChannels(data);
      } catch (err: any) {
        console.error(err);
        setChannelsError(
          "Failed to connect to backend server. Make sure it is running on http://localhost:8000"
        );
      } finally {
        setLoadingChannels(false);
      }
    }
    loadMetadata();
  }, []);

  // Fetch updated analytics metrics whenever filters or budgets modify
  useEffect(() => {
    if (loadingChannels || channelsError) return;

    const liFilters: LinkedInFilters = {};
    if (selectedIndustry) liFilters.industries = [selectedIndustry];
    if (selectedLiRegion) liFilters.regions = [selectedLiRegion];

    const gdFilters: GDELTFilters = {};
    if (selectedCategory) gdFilters.categories = [selectedCategory];
    if (selectedGdeltRegion) gdFilters.regions = [selectedGdeltRegion];

    async function queryAnalytics() {
      try {
        setLoadingData(true);
        setDataError(null);

        const overlapPromise = fetchOverlap(liFilters, gdFilters);
        const reachPromise = fetchReach(liFilters, gdFilters, {
          linkedin: linkedinBudget,
          gdelt: gdeltBudget,
        });

        const [overlapRes, reachRes] = await Promise.all([
          overlapPromise,
          reachPromise,
        ]);

        setOverlapData(overlapRes);
        setReachData(reachRes);
      } catch (err: any) {
        console.error(err);
        setDataError("Error retrieving calculations from server.");
      } finally {
        setLoadingData(false);
      }
    }

    // Debounce state changes slightly to prevent heavy SQL execution on fast slider changes
    const timer = setTimeout(() => {
      queryAnalytics();
    }, 150);

    return () => clearTimeout(timer);
  }, [
    selectedIndustry,
    selectedLiRegion,
    selectedCategory,
    selectedGdeltRegion,
    linkedinBudget,
    gdeltBudget,
    loadingChannels,
    channelsError,
  ]);

  const activeLiFilters = selectedIndustry || selectedLiRegion ? {
    industries: selectedIndustry ? [selectedIndustry] : undefined,
    regions: selectedLiRegion ? [selectedLiRegion] : undefined
  } : {};

  const activeGdFilters = selectedCategory || selectedGdeltRegion ? {
    categories: selectedCategory ? [selectedCategory] : undefined,
    regions: selectedGdeltRegion ? [selectedGdeltRegion] : undefined
  } : {};

  return (
    <div className="min-h-screen bg-[#0B1117] text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navigation / Header */}
      <header className="border-b border-slate-800 bg-[#0B1117]/95 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase font-mono">
              POC-51 // AUDIENCE OVERLAP ESTIMATOR
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-mono">
            Rail: Distribution & Demand / Data Streams: LinkedIn & GDELT
          </p>
        </div>

        {/* Media Plan Exporter Trigger */}
        {!loadingChannels && !channelsError && (
          <MediaPlanExporter
            linkedinFilters={activeLiFilters}
            gdeltFilters={activeGdFilters}
            budgetAllocation={{ linkedin: linkedinBudget, gdelt: gdeltBudget }}
          />
        )}
      </header>

      {/* Connection Error Notification */}
      {channelsError && (
        <div className="m-6 p-4 border border-red-900 bg-red-950/40 rounded text-red-400 text-sm flex flex-col gap-2 max-w-xl mx-auto mt-12">
          <strong className="font-semibold uppercase tracking-wider text-xs">
            Connection Warning
          </strong>
          <p>{channelsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1.5 bg-red-900 text-red-100 hover:bg-red-800 text-xs font-semibold rounded w-fit cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {loadingChannels && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-wider font-mono">
            Loading data channels...
          </span>
        </div>
      )}

      {/* Main Grid Layout */}
      {!loadingChannels && !channelsError && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-6 p-6">
          {/* Main Visualization Stage (70%) */}
          <main className="lg:col-span-7 lg:border-r lg:border-slate-800 lg:pr-6 flex flex-col gap-6">
            
            {/* KPI Metrics Dashboard Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
              {/* LinkedIn Total */}
              <div className="bg-[#0B1117] border border-white/[0.08] rounded p-3 flex flex-col justify-between hover:border-slate-700 transition">
                <span className="text-[9px] uppercase tracking-wider text-slate-500">
                  LinkedIn Cohort
                </span>
                <span className="font-mono text-lg font-bold text-blue-400 mt-1">
                  {overlapData ? overlapData.linkedin_total.toLocaleString() : "..."}
                </span>
                <span className="text-[9px] text-slate-600 mt-1">Target size</span>
              </div>

              {/* GDELT Total */}
              <div className="bg-[#0B1117] border border-white/[0.08] rounded p-3 flex flex-col justify-between hover:border-slate-700 transition">
                <span className="text-[9px] uppercase tracking-wider text-slate-500">
                  GDELT Readers
                </span>
                <span className="font-mono text-lg font-bold text-cyan-400 mt-1">
                  {overlapData ? overlapData.gdelt_total.toLocaleString() : "..."}
                </span>
                <span className="text-[9px] text-slate-600 mt-1">Target size</span>
              </div>

              {/* Overlap */}
              <div className="bg-[#0B1117] border border-white/[0.08] rounded p-3 flex flex-col justify-between hover:border-slate-700 transition">
                <span className="text-[9px] uppercase tracking-wider text-slate-500">
                  Overlap Size
                </span>
                <span className="font-mono text-lg font-bold text-indigo-400 mt-1">
                  {overlapData ? overlapData.overlap_total.toLocaleString() : "..."}
                </span>
                <span className="text-[9px] text-slate-600 mt-1">Shared members</span>
              </div>

              {/* Union */}
              <div className="bg-[#0B1117] border border-white/[0.08] rounded p-3 flex flex-col justify-between hover:border-slate-700 transition">
                <span className="text-[9px] uppercase tracking-wider text-slate-500">
                  Deduplicated
                </span>
                <span className="font-mono text-lg font-bold text-slate-200 mt-1">
                  {overlapData ? overlapData.union_total.toLocaleString() : "..."}
                </span>
                <span className="text-[9px] text-slate-600 mt-1">Net universe</span>
              </div>

              {/* Jaccard */}
              <div className="bg-[#0B1117] border border-white/[0.08] rounded p-3 flex flex-col justify-between hover:border-slate-700 transition">
                <span className="text-[9px] uppercase tracking-wider text-slate-500">
                  Jaccard Index
                </span>
                <span className="font-mono text-lg font-bold text-pink-400 mt-1">
                  {overlapData
                    ? (overlapData.jaccard_similarity * 100).toFixed(2) + "%"
                    : "..."}
                </span>
                <span className="text-[9px] text-slate-600 mt-1">Overlap ratio</span>
              </div>

              {/* Combined Reach */}
              <div className="bg-[#0B1117] border border-white/[0.08] rounded p-3 flex flex-col justify-between hover:border-slate-700 transition">
                <span className="text-[9px] uppercase tracking-wider text-slate-500">
                  Combined Reach
                </span>
                <span className="font-mono text-lg font-bold text-purple-400 mt-1">
                  {reachData
                    ? reachData.current_allocation.combined_reach.toLocaleString()
                    : "..."}
                </span>
                <span className="text-[9px] text-slate-600 mt-1">Estimated users</span>
              </div>

              {/* Cost Per Reached User */}
              <div className="bg-[#0B1117] border border-white/[0.08] rounded p-3 flex flex-col justify-between hover:border-slate-700 transition">
                <span className="text-[9px] uppercase tracking-wider text-slate-500">
                  Efficiency
                </span>
                <span className="font-mono text-lg font-bold text-amber-400 mt-1">
                  {reachData
                    ? "$" + reachData.current_allocation.cost_per_reached_user.toFixed(3)
                    : "..."}
                </span>
                <span className="text-[9px] text-slate-600 mt-1">Cost / user</span>
              </div>
            </div>

            {/* Main Stage Panel Area */}
            <div className="flex-1 border border-white/[0.08] bg-[#0B1117] rounded-lg p-6 flex flex-col justify-between relative backdrop-blur-sm min-h-[460px]">
              {/* Top corner terminal markers */}
              <div className="absolute top-3 left-3 text-[9px] font-mono text-slate-600 uppercase">
                STAGE_VIEW // {activeTab.toUpperCase()}_TAB
              </div>
              <div className="absolute top-3 right-3 text-[9px] font-mono text-slate-600 uppercase">
                {loadingData ? "RUNNING_ANALYSIS..." : "IDLE"}
              </div>

              {/* Tabs Selector Navigation Header */}
              <div className="flex border-b border-slate-850 mt-2 mb-4">
                <button
                  onClick={() => setActiveTab("overlap")}
                  className={`cursor-pointer px-4 py-2 font-mono text-[10px] uppercase tracking-wider border-b-2 font-semibold -mb-[1px] transition ${
                    activeTab === "overlap"
                      ? "border-blue-500 text-white"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  [01] Audience Overlap
                </button>
                <button
                  onClick={() => setActiveTab("reach")}
                  className={`cursor-pointer px-4 py-2 font-mono text-[10px] uppercase tracking-wider border-b-2 font-semibold -mb-[1px] transition ${
                    activeTab === "reach"
                      ? "border-purple-500 text-white"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  [02] Reach Curves
                </button>
                <button
                  onClick={() => setActiveTab("comparison")}
                  className={`cursor-pointer px-4 py-2 font-mono text-[10px] uppercase tracking-wider border-b-2 font-semibold -mb-[1px] transition ${
                    activeTab === "comparison"
                      ? "border-amber-500 text-white"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  [03] Channel Comparison
                </button>
              </div>

              {/* Recalculating loading overlay */}
              {loadingData && !overlapData && (
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Recalculating curves...
                    </span>
                  </div>
                </div>
              )}

              {/* Active Tab Panel Output */}
              <div className="flex-1 flex flex-col justify-center my-2">
                
                {/* 1. Audience Overlap (Venn) */}
                {activeTab === "overlap" && overlapData && (
                  <VennDiagram
                    linkedinTotal={overlapData.linkedin_total}
                    gdeltTotal={overlapData.gdelt_total}
                    overlapTotal={overlapData.overlap_total}
                    unionTotal={overlapData.union_total}
                    jaccardSimilarity={overlapData.jaccard_similarity}
                  />
                )}

                {/* 2. Reach Curves */}
                {activeTab === "reach" && reachData && (
                  <ReachCurveChart
                    reachPoints={reachData.reach_points}
                    currentAllocation={reachData.current_allocation}
                    linkedinBudget={linkedinBudget}
                    gdeltBudget={gdeltBudget}
                  />
                )}

                {/* 3. Channel Comparison */}
                {activeTab === "comparison" && reachData && overlapData && (
                  <ChannelComparison
                    linkedinReach={reachData.current_allocation.linkedin_reach}
                    linkedinBudget={linkedinBudget}
                    gdeltReach={reachData.current_allocation.gdelt_reach}
                    gdeltBudget={gdeltBudget}
                    combinedReach={reachData.current_allocation.combined_reach}
                    linkedinTotalSize={overlapData.linkedin_total}
                    gdeltTotalSize={overlapData.gdelt_total}
                    unionTotalSize={overlapData.union_total}
                  />
                )}

                {/* Error fallback */}
                {dataError && (
                  <div className="text-center text-red-500 font-mono text-xs my-12">
                    {dataError}
                  </div>
                )}
              </div>

              {/* Bottom status details */}
              <div className="border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row justify-between text-[10px] font-mono text-slate-500 mt-2">
                <span>
                  ACTIVE FILTERS // LI_IND: &quot;{selectedIndustry || "ALL"}&quot; |
                  GDELT_CAT: &quot;{selectedCategory || "ALL"}&quot;
                </span>
                <span className="mt-1 sm:mt-0">
                  STOCHASTIC_PANEL_DEDUPLICATION_v1.0.0
                </span>
              </div>
            </div>
          </main>

          {/* Intelligence Sidebar Panel (30%) */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            {/* 1. Targeting Selector */}
            <AudienceSelector
              channels={channels}
              selectedIndustry={selectedIndustry}
              setSelectedIndustry={setSelectedIndustry}
              selectedLiRegion={selectedLiRegion}
              setSelectedLiRegion={setSelectedLiRegion}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedGdeltRegion={selectedGdeltRegion}
              setSelectedGdeltRegion={setSelectedGdeltRegion}
            />

            {/* 2. Budget cost sliders */}
            <CostSliders
              linkedinBudget={linkedinBudget}
              setLinkedinBudget={setLinkedinBudget}
              gdeltBudget={gdeltBudget}
              setGdeltBudget={setGdeltBudget}
            />

            {/* 3. Info panel group */}
            <WhyThisMatters />
            <WhoControlsTheRail />
          </aside>
        </div>
      )}
    </div>
  );
}
