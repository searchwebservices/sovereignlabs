"use client";

import Link from "next/link";
import {
  Cpu,
  Puzzle,
  Rocket,
  DollarSign,
  ArrowRight,
  Plus,
} from "lucide-react";
import { getDeviceTypeIcon, getDeviceTypeLabel } from "@/lib/lab-icons";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/lab/stat-card";
import { StatusBadge } from "@/components/lab/status-badge";
import { LabPageHeader } from "@/components/lab/lab-page-header";
import { useLabStats } from "@/hooks/use-lab-stats";
import { useDevices } from "@/hooks/use-devices";
import { useInitiatives } from "@/hooks/use-initiatives";
import type { DeviceStatus, InitiativeStatus } from "@/lib/types/lab";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useLabStats();
  const { data: devices, isLoading: devicesLoading } = useDevices();
  const { data: initiatives, isLoading: initiativesLoading } = useInitiatives();

  const recentDevices = devices?.slice(0, 5) || [];
  const activeInitiatives =
    initiatives?.filter((i) => i.status === "active" || i.status === "planning") || [];

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        actions={
          <Button asChild size="sm">
            <Link href="/">
              <Plus className="mr-1.5 size-4" />
              New Chat
            </Link>
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Devices"
            value={statsLoading ? "..." : stats?.deviceCount ?? 0}
            subtitle="Equipment in the lab"
            icon={Cpu}
          />
          <StatCard
            title="Spare Parts"
            value={statsLoading ? "..." : stats?.sparePartCount ?? 0}
            subtitle="Available components"
            icon={Puzzle}
          />
          <StatCard
            title="Active Initiatives"
            value={statsLoading ? "..." : stats?.activeInitiativeCount ?? 0}
            subtitle="Research projects"
            icon={Rocket}
          />
          <StatCard
            title="Inventory Value"
            value={
              statsLoading
                ? "..."
                : formatCurrency(stats?.totalInventoryValue ?? 0)
            }
            subtitle="Total parts value"
            icon={DollarSign}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Devices */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="text-sm font-semibold">Recent Devices</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/devices">
                  View all
                  <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
            <div className="divide-y">
              {devicesLoading ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Loading devices...
                </div>
              ) : recentDevices.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No devices yet
                </div>
              ) : (
                recentDevices.map((device) => {
                  const DeviceIcon = getDeviceTypeIcon(device.type);
                  return (
                    <Link
                      key={device.id}
                      href={`/devices/${device.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <DeviceIcon className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{device.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {device.type ? getDeviceTypeLabel(device.type) : (device.location || "No location")}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={device.status as DeviceStatus} />
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Initiatives */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="text-sm font-semibold">Active Initiatives</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/initiatives">
                  View all
                  <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
            <div className="divide-y">
              {initiativesLoading ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Loading initiatives...
                </div>
              ) : activeInitiatives.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No active initiatives
                </div>
              ) : (
                activeInitiatives.slice(0, 5).map((initiative) => (
                  <Link
                    key={initiative.id}
                    href={`/initiatives/${initiative.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{initiative.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {initiative.target_date
                          ? `Target: ${new Date(initiative.target_date).toLocaleDateString()}`
                          : "No target date"}
                      </p>
                    </div>
                    <StatusBadge status={initiative.status as InitiativeStatus} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
