"use client";

import { useState } from "react";
import { Plus, ShoppingCart, ExternalLink, Cpu, Puzzle } from "lucide-react";
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
import { PriorityBadge } from "@/components/lab/priority-badge";
import { PurchaseForm } from "@/components/lab/purchase-form";
import { EmptyState } from "@/components/lab/empty-state";
import { usePurchases } from "@/hooks/use-purchases";
import type {
  PurchaseWithRelations,
  PurchaseStatus,
  TaskPriority,
} from "@/lib/types/lab";

export default function PurchasesPage() {
  const { data: purchases, isLoading, mutate } = usePurchases();
  const [showCreate, setShowCreate] = useState(false);
  const [editingPurchase, setEditingPurchase] =
    useState<PurchaseWithRelations | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered =
    statusFilter === "all"
      ? purchases || []
      : (purchases || []).filter((p) => p.status === statusFilter);

  const formatCost = (cost: number | null, qty: number) => {
    if (!cost) return "—";
    const total = cost * qty;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(total);
  };

  const pendingTotal = (purchases || [])
    .filter((p) =>
      ["needed", "approved", "ordered", "shipped"].includes(p.status)
    )
    .reduce(
      (sum, p) => sum + (p.quantity || 1) * (p.estimated_cost || 0),
      0
    );

  const columns = [
    {
      key: "item_name",
      header: "Item",
      render: (p: PurchaseWithRelations) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{p.item_name}</span>
            {(p.linked_device || p.linked_part) && (
              <div className="flex items-center gap-1">
                {p.linked_device && (
                  <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <Cpu className="size-2.5" />
                    {p.linked_device.name}
                  </span>
                )}
                {p.linked_part && (
                  <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <Puzzle className="size-2.5" />
                    {p.linked_part.name}
                  </span>
                )}
              </div>
            )}
          </div>
          {p.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {p.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p: PurchaseWithRelations) => (
        <StatusBadge status={p.status as PurchaseStatus} />
      ),
    },
    {
      key: "priority",
      header: "Priority",
      className: "hidden lg:table-cell",
      render: (p: PurchaseWithRelations) => (
        <PriorityBadge priority={p.priority as TaskPriority} />
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      render: (p: PurchaseWithRelations) => (
        <span className="text-muted-foreground">{p.quantity}</span>
      ),
    },
    {
      key: "cost",
      header: "Est. Cost",
      className: "hidden md:table-cell text-right",
      render: (p: PurchaseWithRelations) => (
        <span className="text-muted-foreground">
          {formatCost(p.estimated_cost, p.quantity)}
        </span>
      ),
    },
    {
      key: "vendor",
      header: "Vendor",
      className: "hidden lg:table-cell",
      render: (p: PurchaseWithRelations) => {
        if (!p.vendor) return <span className="text-muted-foreground">—</span>;
        const isUrl =
          p.vendor.startsWith("http://") || p.vendor.startsWith("https://");
        if (isUrl) {
          return (
            <a
              href={p.vendor}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
              onClick={(e) => e.stopPropagation()}
            >
              Link
              <ExternalLink className="size-3" />
            </a>
          );
        }
        return (
          <span className="text-muted-foreground">{p.vendor}</span>
        );
      },
    },
    {
      key: "requested_by",
      header: "Requested By",
      className: "hidden md:table-cell",
      render: (p: PurchaseWithRelations) => (
        <span className="text-muted-foreground">
          {p.requester?.name || "—"}
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
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-1.5 size-4" />
              Add Purchase
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-4">
        {/* Pending total banner */}
        {!isLoading && purchases && purchases.length > 0 && pendingTotal > 0 && (
          <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Pending purchase total:{" "}
            </span>
            <span className="font-semibold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(pendingTotal)}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading purchases...
          </div>
        ) : !purchases || purchases.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No purchases yet"
            description="Add items you need to purchase for the lab."
            action={
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1.5 size-4" />
                Add Purchase
              </Button>
            }
          />
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            searchKey="item_name"
            searchPlaceholder="Search purchases..."
            onRowClick={(p) => setEditingPurchase(p)}
          />
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Purchase</DialogTitle>
          </DialogHeader>
          <PurchaseForm
            onSuccess={() => {
              setShowCreate(false);
              mutate();
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editingPurchase}
        onOpenChange={(open) => !open && setEditingPurchase(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Purchase</DialogTitle>
          </DialogHeader>
          {editingPurchase && (
            <PurchaseForm
              purchase={editingPurchase}
              onSuccess={() => {
                setEditingPurchase(null);
                mutate();
              }}
              onCancel={() => setEditingPurchase(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
