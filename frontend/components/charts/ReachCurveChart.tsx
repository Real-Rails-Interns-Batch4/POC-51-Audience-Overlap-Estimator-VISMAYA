"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface ReachPoint {
  budget: number;
  linkedin_reach: number;
  gdelt_reach: number;
  combined_reach: number;
}

interface ReachCurveChartProps {
  reachPoints: ReachPoint[];
  currentAllocation: {
    linkedin_reach: number;
    gdelt_reach: number;
    combined_reach: number;
  };
  linkedinBudget: number;
  gdeltBudget: number;
}

export function ReachCurveChart({
  reachPoints,
  currentAllocation,
  linkedinBudget,
  gdeltBudget,
}: ReachCurveChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || reachPoints.length === 0) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 55 };
    const width = 550 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X-Axis (Budget in USD)
    const maxX = d3.max(reachPoints, (d) => d.budget) || 50000;
    const xScale = d3.scaleLinear()
      .domain([0, maxX])
      .range([0, width]);

    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => `$${(Number(d) / 1000).toFixed(0)}k`);

    // Y-Axis (Reach in Users)
    const maxY = (d3.max(reachPoints, (d) => d.combined_reach) || 1000) * 1.1; // 10% headroom
    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([height, 0]);

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => d3.format(".2s")(d).replace("G", "B")); // formatted (e.g. 5.2k)

    // Render Gridlines
    svg.append("g")
      .attr("class", "grid-x stroke-slate-800/40")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(6).tickSize(-height).tickFormat(() => ""))
      .call(g => g.select(".domain").remove());

    svg.append("g")
      .attr("class", "grid-y stroke-slate-800/40")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-width).tickFormat(() => ""))
      .call(g => g.select(".domain").remove());

    // X-Axis Label Group
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .attr("class", "text-slate-400 font-mono text-[9px]")
      .call(g => g.select(".domain").attr("stroke", "#334155"));

    // Y-Axis Label Group
    svg.append("g")
      .call(yAxis)
      .attr("class", "text-slate-400 font-mono text-[9px]")
      .call(g => g.select(".domain").attr("stroke", "#334155"));

    // Render Axis Titles
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-family", "monospace")
      .attr("font-size", "8px")
      .text("ADVERTISING BUDGET (USD)");

    // Define Line Generators
    const lineLi = d3.line<ReachPoint>()
      .x((d) => xScale(d.budget))
      .y((d) => yScale(d.linkedin_reach))
      .curve(d3.curveMonotoneX);

    const lineGd = d3.line<ReachPoint>()
      .x((d) => xScale(d.budget))
      .y((d) => yScale(d.gdelt_reach))
      .curve(d3.curveMonotoneX);

    const lineCombined = d3.line<ReachPoint>()
      .x((d) => xScale(d.budget))
      .y((d) => yScale(d.combined_reach))
      .curve(d3.curveMonotoneX);

    // Draw curves
    // 1. LinkedIn Reach curve
    svg.append("path")
      .datum(reachPoints)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 1.5)
      .attr("d", lineLi);

    // 2. GDELT Reach curve
    svg.append("path")
      .datum(reachPoints)
      .attr("fill", "none")
      .attr("stroke", "#06b6d4")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 1.5)
      .attr("d", lineGd);

    // 3. Combined Reach curve
    const pathCombined = svg.append("path")
      .datum(reachPoints)
      .attr("fill", "none")
      .attr("stroke", "#a855f7")
      .attr("stroke-width", 3)
      .attr("d", lineCombined);

    // Animate Combined line drawing
    const totalLength = pathCombined.node()?.getTotalLength() || 0;
    pathCombined
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Draw Budget Allocation Markers
    const totalBudget = linkedinBudget + gdeltBudget;

    // Draw Allocation vertical line
    svg.append("line")
      .attr("x1", xScale(totalBudget))
      .attr("y1", yScale(0))
      .attr("x2", xScale(totalBudget))
      .attr("y2", yScale(currentAllocation.combined_reach))
      .attr("stroke", "#818cf8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4");

    // Dot on Combined
    svg.append("circle")
      .attr("cx", xScale(totalBudget))
      .attr("cy", yScale(currentAllocation.combined_reach))
      .attr("r", 5)
      .attr("fill", "#c084fc")
      .attr("stroke", "#0B1117")
      .attr("stroke-width", 1.5);

    // Dot on LinkedIn (only if active)
    if (linkedinBudget > 0) {
      svg.append("circle")
        .attr("cx", xScale(linkedinBudget))
        .attr("cy", yScale(currentAllocation.linkedin_reach))
        .attr("r", 4)
        .attr("fill", "#60a5fa")
        .attr("stroke", "#0B1117")
        .attr("stroke-width", 1.5);
    }

    // Dot on GDELT (only if active)
    if (gdeltBudget > 0) {
      svg.append("circle")
        .attr("cx", xScale(gdeltBudget))
        .attr("cy", yScale(currentAllocation.gdelt_reach))
        .attr("r", 4)
        .attr("fill", "#22d3ee")
        .attr("stroke", "#0B1117")
        .attr("stroke-width", 1.5);
    }

    // Setup interactive tooltip overlay
    const tooltip = d3.select(containerRef.current).select(".chart-tooltip");
    
    // Vertical line tracker following mouse
    const focusLine = svg.append("line")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#475569")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .style("opacity", 0);

    const trackerOverlay = svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("class", "cursor-crosshair");

    // Bisector to locate closest budget point
    const bisect = d3.bisector((d: ReachPoint) => d.budget).left;

    trackerOverlay
      .on("mouseover", () => {
        focusLine.style("opacity", 1);
        tooltip.style("opacity", 1);
      })
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event, svgRef.current);
        // Map mouse position to budget coordinate
        const budgetVal = xScale.invert(mx - margin.left);
        const idx = bisect(reachPoints, budgetVal);
        const d0 = reachPoints[idx - 1];
        const d1 = reachPoints[idx];
        
        let d = d1;
        if (d0 && d1) {
          d = budgetVal - d0.budget > d1.budget - budgetVal ? d1 : d0;
        }

        if (!d) return;

        focusLine
          .attr("x1", xScale(d.budget))
          .attr("x2", xScale(d.budget));

        // Render Tooltip HTML
        tooltip
          .style("left", `${xScale(d.budget) + margin.left + 15}px`)
          .style("top", `${yScale(d.combined_reach) + 5}px`)
          .html(`
            <div class="text-[9px] font-mono uppercase text-slate-500">Budget: $${d.budget.toLocaleString()}</div>
            <div class="border-t border-slate-800/80 my-1"></div>
            <div class="flex items-center gap-1.5 text-[10px] font-mono">
              <span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              <span class="text-slate-400">LI:</span>
              <span class="text-blue-400 font-bold">${Math.round(d.linkedin_reach).toLocaleString()}</span>
            </div>
            <div class="flex items-center gap-1.5 text-[10px] font-mono">
              <span class="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
              <span class="text-slate-400">GDELT:</span>
              <span class="text-cyan-400 font-bold">${Math.round(d.gdelt_reach).toLocaleString()}</span>
            </div>
            <div class="flex items-center gap-1.5 text-[10px] font-mono mt-0.5">
              <span class="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
              <span class="text-slate-200">Combined:</span>
              <span class="text-purple-400 font-bold">${Math.round(d.combined_reach).toLocaleString()}</span>
            </div>
          `);
      })
      .on("mouseout", () => {
        focusLine.style("opacity", 0);
        tooltip.style("opacity", 0);
      });

  }, [reachPoints, currentAllocation, linkedinBudget, gdeltBudget]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col items-center bg-slate-950/20 rounded-lg p-2 min-h-[300px]">
      <svg ref={svgRef} className="w-full max-h-[280px]" />
      
      {/* Tooltip Overlay */}
      <div 
        className="chart-tooltip absolute pointer-events-none opacity-0 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 shadow-xl transition-opacity duration-150 z-20 min-w-[130px]"
        style={{ left: 0, top: 0 }}
      />
      
      {/* Legend */}
      <div className="flex gap-4 text-[9px] font-mono uppercase text-slate-500 justify-center pb-2">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-blue-500 inline-block border-t border-dashed"></span>
          LinkedIn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-cyan-500 inline-block border-t border-dashed"></span>
          GDELT
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-4 bg-purple-500 inline-block rounded"></span>
          Combined Deduplicated
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-400 inline-block"></span>
          Current Budget Allocation
        </span>
      </div>
    </div>
  );
}
export default ReachCurveChart;
