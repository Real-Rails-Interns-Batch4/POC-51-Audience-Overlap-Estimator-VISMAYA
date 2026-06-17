import React from "react";

interface CostSlidersProps {
  linkedinBudget: number;
  setLinkedinBudget: (v: number) => void;
  gdeltBudget: number;
  setGdeltBudget: (v: number) => void;
}

export function CostSliders({
  linkedinBudget,
  setLinkedinBudget,
  gdeltBudget,
  setGdeltBudget,
}: CostSlidersProps) {
  const total = linkedinBudget + gdeltBudget;
  const liPct = total > 0 ? (linkedinBudget / total) * 100 : 50;
  const gdPct = total > 0 ? (gdeltBudget / total) * 100 : 50;

  return (
    <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
        Budget Allocation
      </h3>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-blue-400 font-medium">LinkedIn Budget</span>
            <span className="font-mono text-slate-300">
              ${linkedinBudget.toLocaleString()} ({liPct.toFixed(0)}%)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="25000"
            step="500"
            value={linkedinBudget}
            onChange={(e) => setLinkedinBudget(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-cyan-400 font-medium">GDELT Budget</span>
            <span className="font-mono text-slate-300">
              ${gdeltBudget.toLocaleString()} ({gdPct.toFixed(0)}%)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="25000"
            step="500"
            value={gdeltBudget}
            onChange={(e) => setGdeltBudget(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>

      <div className="border-t border-slate-800/60 pt-3 flex justify-between text-xs">
        <span className="text-slate-500 uppercase tracking-wider">Total Ad Spend</span>
        <span className="font-mono text-white font-semibold">
          ${total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
export default CostSliders;
