"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatCard } from "@/components/StatCard";
import { CalendarIcon, UsersIcon, TrendingUpIcon, DollarSignIcon } from "lucide-react";

export function DashboardStats() {
  const stats = useQuery(api.events.getDashboardStats);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Upcoming Events"
        value={stats.upcomingCount ?? 0}
        icon={<CalendarIcon className="h-5 w-5" />}
      />
      <StatCard
        label="Registrations This Month"
        value={stats.totalRegistrationsThisMonth ?? 0}
        trend={
          stats.totalRegistrationsLastMonth != null && stats.totalRegistrationsLastMonth > 0
            ? {
                value: Math.round(
                  (((stats.totalRegistrationsThisMonth ?? 0) - stats.totalRegistrationsLastMonth) /
                    stats.totalRegistrationsLastMonth) *
                    100
                ),
                label: "vs last month",
              }
            : undefined
        }
        icon={<UsersIcon className="h-5 w-5" />}
      />
      <StatCard
        label="Registrations Last Month"
        value={stats.totalRegistrationsLastMonth ?? 0}
        icon={<TrendingUpIcon className="h-5 w-5" />}
      />
      <StatCard
        label="Total Revenue"
        value={`$${(stats.totalRevenue ?? 0).toLocaleString()}`}
        icon={<DollarSignIcon className="h-5 w-5" />}
      />
    </div>
  );
}