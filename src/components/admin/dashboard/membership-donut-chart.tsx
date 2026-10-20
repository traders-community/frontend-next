"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { DashboardPlanDistributionPoint } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  "#00c950",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
];

interface MembershipDonutChartProps {
  data: DashboardPlanDistributionPoint[];
  totalMembers?: number;
}

export function MembershipDonutChart({
  data,
  totalMembers = 0,
}: MembershipDonutChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const totalCount = useMemo(() => {
    return data.reduce((sum, item) => sum + (item.count || 0), 0);
  }, [data]);

  const displayTotal = totalMembers > 0 ? totalMembers : totalCount;

  const chartData: ChartData<"doughnut"> = useMemo(() => {
    const labels = data.map((d) => d.label);
    const counts = data.map((d) => d.count);
    const backgroundColors = data.map((_, i) => PALETTE[i % PALETTE.length]);

    // If all counts are 0, show a subtle placeholder arc
    if (totalCount === 0) {
      return {
        labels: ["No active members"],
        datasets: [
          {
            data: [1],
            backgroundColor: [isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"],
            borderWidth: 0,
          },
        ],
      };
    }

    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: isDark ? "#0d162c" : "#ffffff",
          hoverOffset: 4,
        },
      ],
    };
  }, [data, totalCount, isDark]);

  const options: ChartOptions<"doughnut"> = useMemo(() => {
    const textColor = isDark ? "rgba(244, 244, 244, 0.7)" : "rgba(32, 32, 32, 0.7)";
    const tooltipBg = isDark ? "#0d162c" : "#ffffff";
    const tooltipTitle = isDark ? "#ffffff" : "#111827";
    const tooltipBody = isDark ? "#d1d5db" : "#374151";
    const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)";

    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: totalCount > 0,
          backgroundColor: tooltipBg,
          titleColor: tooltipTitle,
          bodyColor: tooltipBody,
          borderColor: tooltipBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          boxPadding: 4,
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const val = Number(context.parsed) || 0;
              const pct = totalCount > 0 ? Math.round((val / totalCount) * 100) : 0;
              return ` ${label}: ${val} (${pct}%)`;
            },
          },
        },
      },
    };
  }, [isDark, totalCount]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 h-full w-full">
      {/* Doughnut Canvas with Centered Count */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
          <span className="text-2xl font-bold text-foreground tracking-tight">
            {displayTotal}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            Active Members
          </span>
        </div>
      </div>

      {/* Clean Custom Legend List on Right */}
      <div className="flex-1 w-full space-y-2.5">
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tier distribution recorded</p>
        ) : (
          data.map((item, idx) => {
            const color = PALETTE[idx % PALETTE.length];
            const pct =
              totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;

            return (
              <div
                key={item.label}
                className="flex items-center justify-between text-xs gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-foreground font-medium truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-muted-foreground font-mono">
                  <span>{item.count}</span>
                  <span className="text-[10px] w-8 text-right text-muted-foreground/80">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
