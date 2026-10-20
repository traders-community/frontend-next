"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { DashboardChartPoint } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueBarChartProps {
  data: DashboardChartPoint[];
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const chartData: ChartData<"bar"> = useMemo(() => {
    const labels = data.map((d) => d.label);
    const values = data.map((d) => d.value);

    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: values,
          backgroundColor: "#00c950",
          hoverBackgroundColor: "#00b046",
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 32,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"bar"> = useMemo(() => {
    const textColor = isDark ? "rgba(244, 244, 244, 0.6)" : "rgba(32, 32, 32, 0.6)";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";
    const tooltipBg = isDark ? "#0d162c" : "#ffffff";
    const tooltipTitle = isDark ? "#ffffff" : "#111827";
    const tooltipBody = isDark ? "#d1d5db" : "#374151";
    const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)";

    return {
      responsive: true,
      maintainAspectRatio: false,
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
            maxTicksLimit: 8,
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

  return <Bar data={chartData} options={options} />;
}
