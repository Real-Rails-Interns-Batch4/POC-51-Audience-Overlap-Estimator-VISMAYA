import React from "react";

export function WhoControlsTheRail() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
      <h3 className="text-sm font-semibold tracking-wider text-slate-300 uppercase mb-3">
        Who Controls The Rail
      </h3>
      <div className="space-y-3 text-xs leading-relaxed text-slate-400">
        <p>
          Media distribution is regulated by two gatekeepers of professional and consumer attention:
        </p>
        <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
          <li>
            <strong className="text-blue-400 font-medium">Microsoft (LinkedIn)</strong>: Dominates the identity-verified professional database rail, controlling access to professional demand segments.
          </li>
          <li>
            <strong className="text-emerald-400 font-medium">Global Media Indexers (GDELT/Google)</strong>: Monitor public discourse, tracking programmatic news networks, search feeds, and aggregators that dictate general consumption.
          </li>
        </ul>
        <p>
          By connecting these two distinct distribution systems, planners can bypass monopolistic pricing structures and target professional consumers across open-web alternatives.
        </p>
      </div>
    </div>
  );
}
export default WhoControlsTheRail;
