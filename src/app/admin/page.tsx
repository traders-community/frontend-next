"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminProfileDropdown } from "@/components/admin/admin-profile-dropdown";
import { FadeIn } from "@/components/motion";
import { DashboardPeriod, DashboardResponse } from "@/types";
import {
  RiMoneyRupeeCircleLine,
  RiGroupLine,
  RiMailSendLine,
} from "@remixicon/react";
import { DashboardTimeFilter } from "@/components/admin/dashboard/dashboard-time-filter";
import { DashboardStatCard } from "@/components/admin/dashboard/dashboard-stat-card";
import { DashboardChartCard } from "@/components/admin/dashboard/dashboard-chart-card";
import { RevenueTrendChart } from "@/components/admin/dashboard/revenue-trend-chart";
import { ProductSalesPieChart } from "@/components/admin/dashboard/product-sales-pie-chart";
import { DashboardRecentBlogs } from "@/components/admin/dashboard/dashboard-recent-blogs";
import { DashboardCommentsAndSupport } from "@/components/admin/dashboard/dashboard-comments-and-support";
import { DashboardRecentOrders } from "@/components/admin/dashboard/dashboard-recent-orders";

const getComparisonPeriodLabel = (p: DashboardPeriod) => {
  switch (p) {
    case "today":
      return "vs yesterday";
    case "7d":
      return "vs previous 7 days";
    case "30d":
      return "vs previous 30 days";
    case "90d":
      return "vs previous 90 days";
    case "12m":
      return "vs previous year";
    case "all":
      return "all time total";
    default:
      return "vs previous period";
  }
};

export default function AdminDashboardPage() {
  const [profileName, setProfileName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("admin_display_name") || "";
      } catch {}
    }
    return "";
  });

  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchProfile = useCallback(() => {
    adminService
      .getProfile()
      .then((res) => {
        if (res.data?.profile) {
          const p = res.data.profile;
          const name = p.displayName || p.name || "";
          if (name) {
            setProfileName(name);
            try {
              localStorage.setItem("admin_display_name", name);
            } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);

  const fetchDashboard = useCallback((selectedPeriod: DashboardPeriod, showSpinner = false) => {
    if (showSpinner) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    adminService
      .getDashboard(selectedPeriod)
      .then((res) => {
        if (res.data?.success) {
          setDashboardData(res.data);
        }
      })
      .catch((err) => {
        console.error("[FETCH DASHBOARD ERROR]:", err);
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchDashboard(period, true);

    const onProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const p = customEvent.detail;
        const name = p.displayName || p.name || "";
        if (name) {
          setProfileName(name);
          try {
            localStorage.setItem("admin_display_name", name);
          } catch {}
        }
      } else {
        fetchProfile();
      }
    };

    window.addEventListener("admin_profile_updated", onProfileUpdate);
    return () => {
      window.removeEventListener("admin_profile_updated", onProfileUpdate);
    };
  }, [fetchProfile, fetchDashboard, period]);

  const handlePeriodChange = (newPeriod: DashboardPeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    fetchDashboard(newPeriod, false);
  };

  const firstName = profileName.trim() ? profileName.trim().split(" ")[0] : "";
  const kpis = dashboardData?.kpis;
  const secondaryStats = dashboardData?.secondaryStats;
  const comparisonLabel = getComparisonPeriodLabel(period);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Top Welcome Header & Filter Controls */}
      <FadeIn direction="down" distance={12} duration={0.42}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
              Overview of your trading community metrics & activity
            </p>
          </div>

          {/* Right Header Actions: Time Filter, Theme Toggle, Profile */}
          <div className="flex items-center flex-wrap gap-3">
            <DashboardTimeFilter
              value={period}
              onChange={handlePeriodChange}
              disabled={isRefreshing}
            />

            {/* Desktop-only Theme Toggle & Profile Dropdown */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              <AdminProfileDropdown align="right" />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Row 1: 3 KPI Cards (Top Stats - NOT whole clickable, clean icons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <FadeIn delay={0.06} distance={14} duration={0.4}>
          <DashboardStatCard
            title="Total Revenue"
            value={`₹${(kpis?.totalRevenue?.value ?? 0).toLocaleString("en-IN")}`}
            icon={RiMoneyRupeeCircleLine}
            change={kpis?.totalRevenue?.change}
            changeLabel={comparisonLabel}
            isLoading={isLoading}
          />
        </FadeIn>

        <FadeIn delay={0.12} distance={14} duration={0.4}>
          <DashboardStatCard
            title="Paid Members"
            value={(kpis?.paidMembers?.value ?? 0).toLocaleString("en-IN")}
            icon={RiGroupLine}
            subtitle="Active Telegram members right now"
            isLoading={isLoading}
          />
        </FadeIn>

        <FadeIn delay={0.18} distance={14} duration={0.4}>
          <DashboardStatCard
            title="Newsletter Subscribers"
            value={`+${(kpis?.newsletterSubscribers?.value ?? 0).toLocaleString("en-IN")}`}
            icon={RiMailSendLine}
            change={kpis?.newsletterSubscribers?.change}
            changeLabel={comparisonLabel}
            subtitle={`${(kpis?.newsletterSubscribers?.totalActive ?? 0).toLocaleString("en-IN")} total active`}
            href="/admin/newsletter/subscribers"
            actionLabel="Subscribers"
            isLoading={isLoading}
          />
        </FadeIn>
      </div>

      {/* Row 2: 2 Diverse Charts (Revenue Trend Line/Area Chart + Product Purchases Pie Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FadeIn delay={0.22} distance={16} duration={0.42}>
          <DashboardChartCard
            title="Revenue Trend"
            subtitle={`Daily/monthly earnings performance (${period.toUpperCase()})`}
            isLoading={isLoading}
          >
            <RevenueTrendChart data={dashboardData?.charts?.revenueTrend ?? []} />
          </DashboardChartCard>
        </FadeIn>

        <FadeIn delay={0.28} distance={16} duration={0.42}>
          <DashboardChartCard
            title="Product Sales Division"
            subtitle="Distribution of purchases across trading products"
            isLoading={isLoading}
          >
            <ProductSalesPieChart
              data={dashboardData?.charts?.productDistribution ?? []}
            />
          </DashboardChartCard>
        </FadeIn>
      </div>

      {/* Row 3: Blogs — FULL WIDTH */}
      <FadeIn delay={0.32} distance={16} duration={0.42}>
        <DashboardRecentBlogs
          blogs={dashboardData?.recentBlogs ?? []}
          publishedCount={secondaryStats?.publishedBlogs ?? 0}
          draftCount={secondaryStats?.draftBlogs ?? 0}
          isLoading={isLoading}
        />
      </FadeIn>

      {/* Row 4: Comments & Support Tickets — 50% - 50% TWO COLUMNS */}
      <FadeIn delay={0.36} distance={16} duration={0.42}>
        <DashboardCommentsAndSupport
          comments={dashboardData?.recentComments ?? []}
          tickets={dashboardData?.recentTickets ?? []}
          pendingCommentsCount={secondaryStats?.pendingComments ?? 0}
          openTicketsCount={secondaryStats?.openTickets ?? 0}
          isLoading={isLoading}
        />
      </FadeIn>

      {/* Row 5: Recent Orders — FULL WIDTH CARD */}
      <FadeIn delay={0.4} distance={18} duration={0.44}>
        <DashboardRecentOrders
          orders={dashboardData?.recentOrders ?? []}
          isLoading={isLoading}
        />
      </FadeIn>
    </div>
  );
}
