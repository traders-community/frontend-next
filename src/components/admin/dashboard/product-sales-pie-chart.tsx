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
import { Pie } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { DashboardProductDistributionPoint } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

const PRODUCT_PALETTE = [
  "#00c950", // primary emerald
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#ec4899", // pink
];

interface ProductSalesPieChartProps {
  data: DashboardProductDistributionPoint[];
}

export function ProductSalesPieChart({ data = [] }: ProductSalesPieChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const totalPurchases = useMemo(() => {
    return data.reduce((sum, item) => sum + (item.count || 0), 0);
  }, [data]);

  const chartData: ChartData<"pie"> = useMemo(() => {
    const labels = data.map((d) => d.label);
    const counts = data.map((d) => d.count);
    const backgroundColors = data.map((_, i) => PRODUCT_PALETTE[i % PRODUCT_PALETTE.length]);

    if (totalPurchases === 0) {
      return {
        labels: ["No orders recorded"],
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
          hoverOffset: 6,
        },
      ],
    };
  }, [data, totalPurchases, isDark]);

  const options: ChartOptions<"pie"> = useMemo(() => {
    const tooltipBg = isDark ? "#0d162c" : "#ffffff";
    const tooltipTitle = isDark ? "#ffffff" : "#111827";
    const tooltipBody = isDark ? "#d1d5db" : "#374151";
    const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)";

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // We render a refined custom legend list on the side
        },
        tooltip: {
          enabled: totalPurchases > 0,
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
              const pct = totalPurchases > 0 ? Math.round((val / totalPurchases) * 100) : 0;
              const itemData = data[context.dataIndex];
              const revText = itemData?.revenue ? ` • ₹${itemData.revenue.toLocaleString("en-IN")}` : "";
              return ` ${label}: ${val} orders (${pct}%)${revText}`;
            },
          },
        },
      },
    };
  }, [isDark, totalPurchases, data]);

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center sm:justify-between lg:justify-center xl:justify-between gap-4 sm:gap-6 lg:gap-3 xl:gap-6 h-full w-full min-w-0 overflow-hidden">
      {/* Pie Canvas */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-36 lg:h-36 xl:w-48 xl:h-48 shrink-0 flex items-center justify-center">
        <Pie data={chartData} options={options} />
      </div>

      {/* Product List Legend */}
      <div className="flex-1 w-full space-y-2 min-w-0 max-w-full overflow-hidden">
        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center sm:text-left lg:text-center xl:text-left">
            No product purchase records found
          </p>
        ) : (
          data.map((item, idx) => {
            const color = PRODUCT_PALETTE[idx % PRODUCT_PALETTE.length];
            const pct =
              totalPurchases > 0 ? Math.round((item.count / totalPurchases) * 100) : 0;

            return (
              <div
                key={item.label}
                className="flex items-center justify-between text-xs gap-2 min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-foreground font-medium truncate" title={item.label}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground font-mono text-[11px]">
                  <span>{item.count} orders</span>
                  <span className="w-8 text-right text-muted-foreground/80 font-semibold">
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
