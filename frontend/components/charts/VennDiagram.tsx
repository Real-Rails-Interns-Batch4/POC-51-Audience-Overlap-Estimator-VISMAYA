"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface VennDiagramProps {
  linkedinTotal: number;
  gdeltTotal: number;
  overlapTotal: number;
  unionTotal: number;
  jaccardSimilarity: number;
}

export function VennDiagram({
  linkedinTotal,
  gdeltTotal,
  overlapTotal,
  unionTotal,
  jaccardSimilarity,
}: VennDiagramProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 450;
    const height = 280;

    // Calculate radii based on relative cohort sizes
    const maxVal = Math.max(linkedinTotal, gdeltTotal, 1);
    const scaleFactor = 90; // Maximum radius

    // Keep radii within visual bounds [35px, 90px]
    const rA = Math.max(35, Math.min(scaleFactor, scaleFactor * Math.sqrt(linkedinTotal / maxVal)));
    const rB = Math.max(35, Math.min(scaleFactor, scaleFactor * Math.sqrt(gdeltTotal / maxVal)));

    // Calculate center distance.
    // Higher Jaccard similarity pulls circles closer together.
    const overlapRatio = jaccardSimilarity;
    const minD = Math.abs(rA - rB);
    const maxD = rA + rB + 10;
    const d = maxD - (maxD - minD) * Math.sqrt(overlapRatio);

    // Center calculations inside SVG
    const cxA = width / 2 - d / 2;
    const cxB = width / 2 + d / 2;
    const cy = height / 2;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%");

    // Setup tooltip
    const tooltip = d3.select(containerRef.current)
      .select(".venn-tooltip");

    // 1. LinkedIn Circle Group
    const groupA = svg.append("g")
      .attr("class", "cohort-group-li");

    const circleA = groupA.append("circle")
      .attr("cx", cxA)
      .attr("cy", cy)
      .attr("r", 0) // Start at 0 for animation
      .attr("fill", "#3b82f6")
      .attr("fill-opacity", 0.15)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("class", "cursor-pointer transition-colors duration-200 hover:fill-opacity-25");

    // Animate radius entry
    circleA.transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .attr("r", rA);

    // 2. GDELT Circle Group
    const groupB = svg.append("g")
      .attr("class", "cohort-group-gd");

    const circleB = groupB.append("circle")
      .attr("cx", cxB)
      .attr("cy", cy)
      .attr("r", 0) // Start at 0 for animation
      .attr("fill", "#06b6d4")
      .attr("fill-opacity", 0.15)
      .attr("stroke", "#06b6d4")
      .attr("stroke-width", 2)
      .attr("class", "cursor-pointer transition-colors duration-200 hover:fill-opacity-25");

    // Animate radius entry
    circleB.transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .attr("r", rB);

    // Interactive tooltip events
    circleA.on("mouseover", (event) => {
      tooltip.style("opacity", 1)
        .html(`
          <div class="text-[10px] font-mono uppercase text-slate-500">LinkedIn Only</div>
          <div class="text-xs font-mono font-bold text-blue-400 mt-0.5">${(linkedinTotal - overlapTotal).toLocaleString()} users</div>
          <div class="text-[9px] text-slate-400 mt-1">Total: ${linkedinTotal.toLocaleString()}</div>
        `);
    })
    .on("mousemove", (event) => {
      const [mx, my] = d3.pointer(event, svgRef.current);
      tooltip.style("left", `${mx + 15}px`)
        .style("top", `${my - 15}px`);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

    circleB.on("mouseover", (event) => {
      tooltip.style("opacity", 1)
        .html(`
          <div class="text-[10px] font-mono uppercase text-slate-500">GDELT Only</div>
          <div class="text-xs font-mono font-bold text-cyan-400 mt-0.5">${(gdeltTotal - overlapTotal).toLocaleString()} readers</div>
          <div class="text-[9px] text-slate-400 mt-1">Total: ${gdeltTotal.toLocaleString()}</div>
        `);
    })
    .on("mousemove", (event) => {
      const [mx, my] = d3.pointer(event, svgRef.current);
      tooltip.style("left", `${mx + 15}px`)
        .style("top", `${my - 15}px`);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

    // 3. Central Overlap Indicator Text
    if (overlapTotal > 0) {
      // Calculate intersection midpoint
      const midX = (cxA + cxB) / 2;
      
      const overlapIndicator = svg.append("g")
        .attr("class", "overlap-indicator")
        .style("opacity", 0);

      overlapIndicator.append("rect")
        .attr("x", midX - 45)
        .attr("y", cy - 18)
        .attr("width", 90)
        .attr("height", 36)
        .attr("rx", 4)
        .attr("fill", "#030712")
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", 1)
        .attr("class", "cursor-pointer");

      overlapIndicator.append("text")
        .attr("x", midX)
        .attr("y", cy - 4)
        .attr("text-anchor", "middle")
        .attr("fill", "#c084fc")
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .text(overlapTotal.toLocaleString());

      overlapIndicator.append("text")
        .attr("x", midX)
        .attr("y", cy + 8)
        .attr("text-anchor", "middle")
        .attr("fill", "#a78bfa")
        .attr("font-size", "8px")
        .attr("font-family", "monospace")
        .text("OVERLAP");

      overlapIndicator.transition()
        .delay(500)
        .duration(400)
        .style("opacity", 1);
        
      // Overlap hover tooltip
      overlapIndicator.on("mouseover", (event) => {
        tooltip.style("opacity", 1)
          .html(`
            <div class="text-[10px] font-mono uppercase text-slate-500">Shared Audience</div>
            <div class="text-xs font-mono font-bold text-purple-400 mt-0.5">${overlapTotal.toLocaleString()} users</div>
            <div class="text-[9px] text-slate-400 mt-1">Jaccard Index: ${(jaccardSimilarity * 100).toFixed(2)}%</div>
          `);
      })
      .on("mousemove", (event) => {
        const [mx, my] = d3.pointer(event, svgRef.current);
        tooltip.style("left", `${mx + 15}px`)
          .style("top", `${my - 15}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
    }

  }, [linkedinTotal, gdeltTotal, overlapTotal, unionTotal, jaccardSimilarity]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-slate-950/20 rounded-lg p-4">
      <svg ref={svgRef} className="max-w-[450px] max-h-[280px]" />
      
      {/* Tooltip Overlay */}
      <div 
        className="venn-tooltip absolute pointer-events-none opacity-0 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 shadow-xl transition-opacity duration-150 z-20 max-w-[200px]"
        style={{ left: 0, top: 0 }}
      />
    </div>
  );
}
export default VennDiagram;
