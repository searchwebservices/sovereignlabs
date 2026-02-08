"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LabPageHeader } from "@/components/lab/lab-page-header";
import { DataTable } from "@/components/lab/data-table";
import { StatusBadge } from "@/components/lab/status-badge";
import { DeviceForm } from "@/components/lab/device-form";
import { EmptyState } from "@/components/lab/empty-state";
import { useDevices } from "@/hooks/use-devices";
import { getDeviceTypeIcon, getDeviceTypeLabel } from "@/lib/lab-icons";
import { Cpu } from "lucide-react";
import type { Device, DeviceStatus } from "@/lib/types/lab";

export default function DevicesPage() {
  const router = useRouter();
  const { data: devices, isLoading, mutate } = useDevices();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered =
    statusFilter === "all"
      ? devices || []
      : (devices || []).filter((d) => d.status === statusFilter);

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (d: Device) => {
        const TypeIcon = getDeviceTypeIcon(d.type);
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <TypeIcon className="size-4 text-muted-foreground" />
            </div>
            <div>
              <span className="font-medium">{d.name}</span>
              {d.type && (
                <p className="text-xs text-muted-foreground">
                  {getDeviceTypeLabel(d.type)}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (d: Device) => <StatusBadge status={d.status as DeviceStatus} />,
    },
    {
      key: "location",
      header: "Location",
      className: "hidden md:table-cell",
      render: (d: Device) => (
        <span className="text-muted-foreground">{d.location || "—"}</span>
      ),
    },
    {
      key: "serial",
      header: "Serial",
      className: "hidden lg:table-cell",
      render: (d: Device) => (
        <span className="text-muted-foreground font-mono text-xs">
          {d.serial_number || "—"}
        </span>
      ),
    },
    {
      key: "cost",
      header: "Cost",
      className: "hidden md:table-cell text-right",
      render: (d: Device) => (
        <span className="text-muted-foreground">
          {d.cost
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(d.cost)
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        actions={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-1.5 size-4" />
              Add Device
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading devices...
          </div>
        ) : !devices || devices.length === 0 ? (
          <EmptyState
            icon={Cpu}
            title="No devices yet"
            description="Add your first lab device to get started tracking equipment."
            action={
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1.5 size-4" />
                Add Device
              </Button>
            }
          />
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search devices..."
            onRowClick={(d) => router.push(`/devices/${d.id}`)}
          />
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
          </DialogHeader>
          <DeviceForm
            onSuccess={() => {
              setShowCreate(false);
              mutate();
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
