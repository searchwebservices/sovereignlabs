"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LabPageHeader } from "@/components/lab/lab-page-header";
import { DataTable } from "@/components/lab/data-table";
import { StatusBadge } from "@/components/lab/status-badge";
import { PartForm } from "@/components/lab/part-form";
import { EmptyState } from "@/components/lab/empty-state";
import { useParts } from "@/hooks/use-parts";
import { getPartCategoryIcon, getPartCategoryLabel } from "@/lib/lab-icons";
import type { PartWithDevice, PartStatus } from "@/lib/types/lab";

export default function PartsPage() {
  const router = useRouter();
  const { data: parts, isLoading, mutate } = useParts();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"all" | "spare" | "attached">("all");

  const filtered =
    tab === "all"
      ? parts || []
      : (parts || []).filter((p) => p.status === tab);

  const spareCount = (parts || []).filter((p) => p.status === "spare").length;
  const attachedCount = (parts || []).filter(
    (p) => p.status === "attached"
  ).length;

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (p: PartWithDevice) => {
        const CategoryIcon = getPartCategoryIcon(p.category);
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <CategoryIcon className="size-4 text-muted-foreground" />
            </div>
            <div>
              <span className="font-medium">{p.name}</span>
              {p.category && (
                <p className="text-xs text-muted-foreground">
                  {getPartCategoryLabel(p.category)}
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
      render: (p: PartWithDevice) => (
        <StatusBadge status={p.status as PartStatus} />
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      render: (p: PartWithDevice) => <span>{p.quantity}</span>,
    },
    {
      key: "device",
      header: "Device",
      className: "hidden md:table-cell",
      render: (p: PartWithDevice) => (
        <span className="text-muted-foreground">
          {p.device?.name || "—"}
        </span>
      ),
    },
    {
      key: "cost",
      header: "Value",
      className: "hidden md:table-cell text-right",
      render: (p: PartWithDevice) => (
        <span className="text-muted-foreground">
          {p.unit_cost
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(p.unit_cost * p.quantity)
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        title="Parts"
        description="Track components and inventory"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 size-4" />
            Add Part
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
          {[
            { key: "all" as const, label: `All (${parts?.length ?? 0})` },
            { key: "spare" as const, label: `Spare (${spareCount})` },
            { key: "attached" as const, label: `Attached (${attachedCount})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading parts...
          </div>
        ) : !parts || parts.length === 0 ? (
          <EmptyState
            icon={Puzzle}
            title="No parts yet"
            description="Add your first part to start tracking inventory."
            action={
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1.5 size-4" />
                Add Part
              </Button>
            }
          />
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search parts..."
            onRowClick={(p) => router.push(`/parts/${p.id}`)}
          />
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
          </DialogHeader>
          <PartForm
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
