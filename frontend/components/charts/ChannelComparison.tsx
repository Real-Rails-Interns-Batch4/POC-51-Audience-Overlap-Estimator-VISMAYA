import React from "react";

interface ChannelComparisonProps {
  linkedinReach: number;
  linkedinBudget: number;
  gdeltReach: number;
  gdeltBudget: number;
  combinedReach: number;
  linkedinTotalSize: number;
  gdeltTotalSize: number;
  unionTotalSize: number;
}

export function ChannelComparison({
  linkedinReach,
  linkedinBudget,
  gdeltReach,
  gdeltBudget,
  combinedReach,
  linkedinTotalSize,
  gdeltTotalSize,
  unionTotalSize,
}: ChannelComparisonProps) {
  const totalBudget = linkedinBudget + gdeltBudget;

  const liCpr = linkedinReach > 0 ? linkedinBudget / linkedinReach : 0.0;
  const gdCpr = gdeltReach > 0 ? gdeltBudget / gdeltReach : 0.0;
  const combinedCpr = combinedReach > 0 ? totalBudget / combinedReach : 0.0;

  // Percentage of cohort reached
  const liPct = linkedinTotalSize > 0 ? (linkedinReach / linkedinTotalSize) * 100 : 0;
  const gdPct = gdeltTotalSize > 0 ? (gdeltReach / gdeltTotalSize) * 100 : 0;
  const combinedPct = unionTotalSize > 0 ? (combinedReach / unionTotalSize) * 100 : 0;

  // Duplication waste statistics
  const overlapAverted = (linkedinReach + gdeltReach) - combinedReach;
  const overlapPct = (linkedinReach + gdeltReach) > 0 ? (overlapAverted / (linkedinReach + gdeltReach)) * 100 : 0;

  return (
    <div className="space-y-6 bg-slate-950/20 rounded-lg p-4">
      
      {/* Side-by-side Channel Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. LinkedIn Card */}
        <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-4 flex flex-col justify-between hover:border-blue-500/50 transition">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400">LinkedIn B2B</span>
              <span className="text-[9px] font-mono text-slate-500">ACTIVE</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-mono font-bold text-white">
                {Math.round(linkedinReach).toLocaleString()}
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Reached Audience</span>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mb-1">
                <span>COHORT PENETRATION</span>
                <span>{liPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${liPct}%` }} />
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-2 flex justify-between text-[10px] font-mono">
              <span className="text-slate-500">Cost:</span>
              <span className="text-slate-300">${linkedinBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-500">Cost / Reached User:</span>
              <span className="text-blue-400 font-bold">${liCpr.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* 2. GDELT Card */}
        <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-4 flex flex-col justify-between hover:border-cyan-500/50 transition">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400">GDELT Stream</span>
              <span className="text-[9px] font-mono text-slate-500">ACTIVE</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-mono font-bold text-white">
                {Math.round(gdeltReach).toLocaleString()}
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Reached Readers</span>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mb-1">
                <span>COHORT PENETRATION</span>
                <span>{gdPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${gdPct}%` }} />
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-2 flex justify-between text-[10px] font-mono">
              <span className="text-slate-500">Cost:</span>
              <span className="text-slate-300">${gdeltBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-500">Cost / Reached User:</span>
              <span className="text-cyan-400 font-bold">${gdCpr.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* 3. Combined deduplicated Card */}
        <div className="border border-indigo-900/50 bg-indigo-950/10 rounded-lg p-4 flex flex-col justify-between hover:border-indigo-500/50 transition">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400">Combined Portfolio</span>
              <span className="text-[9px] font-mono text-indigo-400 font-bold">DEDUPLICATED</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-mono font-bold text-white">
                {Math.round(combinedReach).toLocaleString()}
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Total Net Reach</span>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mb-1">
                <span>PORTFOLIO PENETRATION</span>
                <span>{combinedPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${combinedPct}%` }} />
              </div>
            </div>

            <div className="border-t border-indigo-900/40 pt-2 flex justify-between text-[10px] font-mono">
              <span className="text-slate-500">Total Ad Spend:</span>
              <span className="text-slate-300">${totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-500">Deduplicated Cost / User:</span>
              <span className="text-amber-400 font-bold">${combinedCpr.toFixed(3)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Deduplication Efficiency Panel */}
      {overlapAverted > 0 && (
        <div className="border border-purple-950 bg-purple-950/20 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
              Overlap Deduplication Savings
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
              By modeling and accounting for the shared audience between platforms, this media plan prevented double-serving ads to the same individuals.
            </p>
          </div>
          <div className="flex gap-4 self-start sm:self-center">
            <div className="bg-slate-900/60 border border-slate-800 rounded px-3 py-1.5 min-w-[100px] text-center">
              <span className="block text-[8px] uppercase tracking-wider font-mono text-slate-500">Averted Duplications</span>
              <span className="text-sm font-mono font-bold text-purple-400">+{Math.round(overlapAverted).toLocaleString()}</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded px-3 py-1.5 min-w-[100px] text-center">
              <span className="block text-[8px] uppercase tracking-wider font-mono text-slate-500">Waste Averted</span>
              <span className="text-sm font-mono font-bold text-cyan-400">{overlapPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default ChannelComparison;
