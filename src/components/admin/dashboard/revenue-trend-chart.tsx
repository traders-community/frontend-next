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
  ScriptableContext,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { DashboardChartPoint } from "@/types";

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

interface RevenueTrendChartProps {
  data: DashboardChartPoint[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const chartData: ChartData<"line"> = useMemo(() => {
    const labels = data.map((d) => d.label);
    const values = data.map((d) => d.value);

    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: values,
          borderColor: "#00c950",
          borderWidth: 2,
          pointRadius: values.length > 20 ? 0 : 3,
          pointHoverRadius: 5,
          pointBackgroundColor: "#00c950",
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#00c950",
          pointHoverBorderWidth: 2,
          tension: 0.35,
          fill: true,
          backgroundColor: (context: ScriptableContext<"line">) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 240);
            gradient.addColorStop(0, "rgba(0, 201, 80, 0.22)");
            gradient.addColorStop(1, "rgba(0, 201, 80, 0.0)");
            return gradient;
          },
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
          display: false,
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
              const val = context.parsed.y ?? 0;
              return ` Revenue: ₹${val.toLocaleString("en-IN")}`;
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
            font: {
              size: 11,
              family: "inherit",
            },
            callback: (value) => {
              const num = Number(value);
              if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
              if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
              return `₹${num}`;
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
        No revenue data recorded for this period
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
}
