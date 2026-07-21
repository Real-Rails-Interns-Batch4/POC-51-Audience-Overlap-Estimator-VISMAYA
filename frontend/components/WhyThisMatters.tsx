import React from "react";

export function WhyThisMatters() {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0B1117] p-4 backdrop-blur-sm">
      <h3 className="text-sm font-semibold tracking-wider text-slate-300 uppercase mb-3">
        Why This Matters
      </h3>
      <div className="space-y-3 text-xs leading-relaxed text-slate-400">
        <p>
          In the <strong className="text-blue-400 font-medium">Distribution & Demand</strong> rail, media budgets are frequently deployed across professional platforms (LinkedIn) and public content streams (GDELT) in isolation.
        </p>
        <p>
          Without precise overlap models, multi-channel planning double-counts audiences, inflating reach estimates and wasting ad spend on redundant exposures.
        </p>
        <p>
          Deduplicating these panels using stochastically mapped interest attributes ensures that ad dollars purchase <strong className="text-cyan-400 font-medium">incremental reach</strong>, maximizing distribution efficiency.
        </p>
      </div>
    </div>
  );
}
export default WhyThisMatters;
