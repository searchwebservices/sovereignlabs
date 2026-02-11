"use client";

import { useState } from "react";
import { Calendar, DollarSign, Plus, Receipt, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { EmptyState } from "@/components/lab/empty-state";
import { PurchaseForm } from "@/components/lab/purchase-form";
import { StatCard } from "@/components/lab/stat-card";
import { StatusBadge } from "@/components/lab/status-badge";
import { usePurchases } from "@/hooks/use-purchases";
import type { PurchaseStatus, PurchaseWithRelations } from "@/lib/types/lab";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const committedStatuses: PurchaseStatus[] = [
  "approved",
  "ordered",
  "shipped",
];

export default function ExpensesPage() {
  const { data: purchases, isLoading, mutate } = usePurchases();
  const [showCreate, setShowCreate] = useState(false);
  const [editingPurchase, setEditingPurchase] =
    useState<PurchaseWithRelations | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | PurchaseStatus>(
    "all"
  );
  const [timeRange, setTimeRange] = useState<"all" | "30d" | "90d">("90d");

  const isWithinRange = (createdAt: string) => {
    if (timeRange === "all") return true;
    const days = timeRange === "30d" ? 30 : 90;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const created = new Date(createdAt);
    created.setHours(0, 0, 0, 0);
    const diff = now.getTime() - created.getTime();
    return diff <= days * 24 * 60 * 60 * 1000;
  };

  const totalPurchases = purchases?.length || 0;
  const scoped = (purchases || []).filter((p) => isWithinRange(p.created_at));
  const filtered =
    statusFilter === "all"
      ? scoped
      : scoped.filter((p) => p.status === statusFilter);

  const realizedTotal = scoped
    .filter((p) => p.status === "received")
    .reduce(
      (sum, p) => sum + (p.estimated_cost || 0) * (p.quantity || 1),
      0
    );

  const committedTotal = scoped
    .filter((p) => committedStatuses.includes(p.status))
    .reduce(
      (sum, p) => sum + (p.estimated_cost || 0) * (p.quantity || 1),
      0
    );

  const avgExpense =
    scoped.length === 0 ? 0 : (realizedTotal + committedTotal) / scoped.length;

  const emptyStateTitle =
    totalPurchases === 0
      ? "No expenses yet"
      : scoped.length === 0
        ? "No expenses in this time range"
        : "No expenses match this filter";

  const emptyStateDescription =
    totalPurchases === 0
      ? "Track spending by adding purchases and updating their status."
      : scoped.length === 0
        ? "Expand the time window to view older spending records."
        : "Try another status to see matching expenses.";

  const columns = [
    {
      key: "item_name",
      header: "Expense Item",
      render: (p: PurchaseWithRelations) => (
        <div>
          <p className="font-medium">{p.item_name}</p>
          {p.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
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
      key: "quantity",
      header: "Qty",
      render: (p: PurchaseWithRelations) => (
        <span className="text-muted-foreground">{p.quantity}</span>
      ),
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
    {
      key: "created_at",
      header: "Date",
      className: "hidden md:table-cell",
      render: (p: PurchaseWithRelations) => (
        <span className="text-muted-foreground">
          {new Date(p.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "total_cost",
      header: "Est. Total",
      className: "text-right",
      render: (p: PurchaseWithRelations) => (
        <span className="font-medium">
          {p.estimated_cost
            ? formatCurrency(p.estimated_cost * p.quantity)
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
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "all" | "30d" | "90d")}>
              <SelectTrigger className="h-9 w-[120px]">
                <SelectValue placeholder="Window" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="90d">Last 90d</SelectItem>
                <SelectItem value="30d">Last 30d</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as "all" | PurchaseStatus)
              }
            >
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue placeholder="Status" />
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
              Add Expense
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Realized Spend"
            value={isLoading ? "..." : formatCurrency(realizedTotal)}
            subtitle="Received purchases"
            icon={DollarSign}
          />
          <StatCard
            title="Committed Spend"
            value={isLoading ? "..." : formatCurrency(committedTotal)}
            subtitle="Approved, ordered, shipped"
            icon={TrendingUp}
          />
          <StatCard
            title="Tracked Items"
            value={isLoading ? "..." : scoped.length}
            subtitle="Purchases in selected window"
            icon={Receipt}
          />
          <StatCard
            title="Average Item Value"
            value={isLoading ? "..." : formatCurrency(avgExpense)}
            subtitle="Realized + committed / items"
            icon={Calendar}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading expenses...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={emptyStateTitle}
            description={emptyStateDescription}
            action={
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1.5 size-4" />
                Add Expense
              </Button>
            }
          />
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            searchKey="item_name"
            searchPlaceholder="Search expenses..."
            onRowClick={(purchase) => setEditingPurchase(purchase)}
          />
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription className="sr-only">
              Fill in expense details to track lab spending.
            </DialogDescription>
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

      <Dialog
        open={!!editingPurchase}
        onOpenChange={(open) => !open && setEditingPurchase(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription className="sr-only">
              Update the selected expense.
            </DialogDescription>
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
