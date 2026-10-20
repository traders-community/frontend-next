"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { DashboardMemberGrowthPoint } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MemberGrowthChartProps {
  data: DashboardMemberGrowthPoint[];
}

export function MemberGrowthChart({ data }: MemberGrowthChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const chartData: ChartData<"line"> = useMemo(() => {
    const labels = data.map((d) => d.label);
    const newMembers = data.map((d) => d.newMembers);
    const expiredMembers = data.map((d) => d.expiredMembers);

    return {
      labels,
      datasets: [
        {
          label: "New Members",
          data: newMembers,
          borderColor: "#00c950",
          backgroundColor: "rgba(0, 201, 80, 0.08)",
          borderWidth: 2,
          pointRadius: newMembers.length > 20 ? 0 : 3,
          pointHoverRadius: 5,
          pointBackgroundColor: "#00c950",
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#00c950",
          tension: 0.35,
          fill: true,
        },
        {
          label: "Expired Members",
          data: expiredMembers,
          borderColor: "#f43f5e",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: expiredMembers.length > 20 ? 0 : 3,
          pointHoverRadius: 5,
          pointBackgroundColor: "#f43f5e",
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#f43f5e",
          tension: 0.35,
          fill: false,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"line"> = useMemo(() => {
    const textColor = isDark ? "rgba(244, 244, 244, 0.6)" : "rgba(32, 32, 32, 0.6)";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";
    const tooltipBg = isDark ? "#0d162c" : "#ffffff";
    const tooltipTitle = isDark ? "#ffffff" : "#111827";
    const tooltipBody = isDark ? "#d1d5db" : "#374151";
    const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)";

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          align: "end" as const,
          labels: {
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
            pointStyle: "circle",
            color: textColor,
            font: {
              size: 11,
              family: "inherit",
              weight: 500,
            },
            padding: 12,
          },
        },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: tooltipTitle,
          bodyColor: tooltipBody,
          borderColor: tooltipBorder,
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          boxPadding: 4,
          usePointStyle: true,
          callbacks: {
            label: (context) => {
              const datasetLabel = context.dataset.label || "";
              const val = context.parsed.y ?? 0;
              return ` ${datasetLabel}: ${val}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: textColor,
            font: {
              size: 11,
              family: "inherit",
            },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7,
          },
        },
        y: {
          border: {
            display: false,
          },
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
            precision: 0,
            font: {
              size: 11,
              family: "inherit",
            },
          },
          beginAtZero: true,
        },
      },
    };
  }, [isDark]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
        No membership activity recorded for this period
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
}
