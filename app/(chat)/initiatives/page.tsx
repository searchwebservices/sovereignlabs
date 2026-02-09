"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LabPageHeader } from "@/components/lab/lab-page-header";
import { StatusBadge } from "@/components/lab/status-badge";
import { InitiativeForm } from "@/components/lab/initiative-form";
import { EmptyState } from "@/components/lab/empty-state";
import { useInitiatives } from "@/hooks/use-initiatives";
import type { Initiative, InitiativeStatus } from "@/lib/types/lab";

const statusColumns: { key: InitiativeStatus; label: string }[] = [
  { key: "planning", label: "Planning" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

export default function InitiativesPage() {
  const router = useRouter();
  const { data: initiatives, isLoading, mutate } = useInitiatives();
  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState<"board" | "list">("board");

  const byStatus = (status: InitiativeStatus) =>
    (initiatives || []).filter((i) => i.status === status);

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => setView("board")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  view === "board"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                type="button"
              >
                Board
              </button>
              <button
                onClick={() => setView("list")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  view === "list"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                type="button"
              >
                List
              </button>
            </div>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-1.5 size-4" />
              New Initiative
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading initiatives...
          </div>
        ) : !initiatives || initiatives.length === 0 ? (
          <EmptyState
            icon={Rocket}
            title="No initiatives yet"
            description="Create your first research initiative to start managing projects."
            action={
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1.5 size-4" />
                New Initiative
              </Button>
            }
          />
        ) : view === "board" ? (
          /* Kanban Board View */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statusColumns.map((col) => {
              const items = byStatus(col.key);
              return (
                <div key={col.key} className="flex flex-col">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{col.label}</h3>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {items.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {items.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                        No initiatives
                      </div>
                    ) : (
                      items.map((initiative) => (
                        <button
                          key={initiative.id}
                          onClick={() =>
                            router.push(`/initiatives/${initiative.id}`)
                          }
                          className="rounded-lg border bg-card p-3 text-left shadow-sm hover:bg-muted/50 transition-colors"
                          type="button"
                        >
                          <p className="text-sm font-medium">
                            {initiative.name}
                          </p>
                          {initiative.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {initiative.description}
                            </p>
                          )}
                          {initiative.target_date && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Target:{" "}
                              {new Date(
                                initiative.target_date
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Target Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {initiatives.map((initiative) => (
                  <tr
                    key={initiative.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() =>
                      router.push(`/initiatives/${initiative.id}`)
                    }
                  >
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{initiative.name}</p>
                        {initiative.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {initiative.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge
                        status={initiative.status as InitiativeStatus}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {initiative.start_date
                        ? new Date(
                            initiative.start_date
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {initiative.target_date
                        ? new Date(
                            initiative.target_date
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Initiative</DialogTitle>
            <DialogDescription className="sr-only">Fill in the details to create a new initiative.</DialogDescription>
          </DialogHeader>
          <InitiativeForm
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
