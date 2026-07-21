import React from "react";

interface AudienceSelectorProps {
  channels: any;
  selectedIndustry: string;
  setSelectedIndustry: (v: string) => void;
  selectedLiRegion: string;
  setSelectedLiRegion: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedGdeltRegion: string;
  setSelectedGdeltRegion: (v: string) => void;
}

export function AudienceSelector({
  channels,
  selectedIndustry,
  setSelectedIndustry,
  selectedLiRegion,
  setSelectedLiRegion,
  selectedCategory,
  setSelectedCategory,
  selectedGdeltRegion,
  setSelectedGdeltRegion,
}: AudienceSelectorProps) {
  const linkedin = channels?.channels?.find((c: any) => c.id === "linkedin");
  const gdelt = channels?.channels?.find((c: any) => c.id === "gdelt");

  const industries = linkedin?.filters?.industries || [];
  const liRegions = linkedin?.filters?.regions || [];

  const categories = gdelt?.filters?.categories || [];
  const gdeltRegions = gdelt?.filters?.regions || [];

  return (
    <div className="space-y-5 rounded-lg border border-white/[0.08] bg-[#0B1117] p-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">
          LinkedIn Professional Cohort
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Industry
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Industries</option>
              {industries.map((ind: string) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Region
            </label>
            <select
              value={selectedLiRegion}
              onChange={(e) => setSelectedLiRegion(e.target.value)}
              className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Regions</option>
              {liRegions.map((reg: string) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/60 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
          GDELT Media Cohort
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Interest Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Region
            </label>
            <select
              value={selectedGdeltRegion}
              onChange={(e) => setSelectedGdeltRegion(e.target.value)}
              className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Regions</option>
              {gdeltRegions.map((reg: string) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AudienceSelector;
