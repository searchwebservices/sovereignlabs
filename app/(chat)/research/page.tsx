"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  Plus,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LabPageHeader } from "@/components/lab/lab-page-header";
import { DataTable } from "@/components/lab/data-table";
import { EmptyState } from "@/components/lab/empty-state";
import { InitiativeForm } from "@/components/lab/initiative-form";
import { ResearchDocumentForm } from "@/components/lab/research-document-form";
import { StatCard } from "@/components/lab/stat-card";
import { StatusBadge } from "@/components/lab/status-badge";
import { useInitiatives } from "@/hooks/use-initiatives";
import {
  useFinalResearchDocuments,
  useResearchDocuments,
} from "@/hooks/use-research-documents";
import type {
  Initiative,
  ResearchDocumentWithRelations,
} from "@/lib/types/lab";

type ResearchStage = "suggested" | "approved" | "executing" | "finalized";

function formatRole(role: string | null | undefined): string {
  if (!role) return "Member";
  return role
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default function ResearchPage() {
  const router = useRouter();
  const { data: initiatives, isLoading: initiativesLoading, mutate: mutateInitiatives } =
    useInitiatives();
  const { isLoading: documentsLoading, mutate: mutateDocuments } =
    useResearchDocuments();
  const { data: finalDocuments } = useFinalResearchDocuments();

  const [showCreateInitiative, setShowCreateInitiative] = useState(false);
  const [showCreateDocument, setShowCreateDocument] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<ResearchDocumentWithRelations | null>(null);
  const [tab, setTab] = useState<"all" | ResearchStage | "archived">("all");

  const normalizedInitiatives = useMemo(() => initiatives || [], [initiatives]);

  const filteredInitiatives =
    tab === "all"
      ? normalizedInitiatives
      : normalizedInitiatives.filter(
          (initiative) => initiative.status === tab
        );

  const suggestedCount = normalizedInitiatives.filter(
    (initiative) => initiative.status === "suggested"
  ).length;
  const approvedCount = normalizedInitiatives.filter(
    (initiative) => initiative.status === "approved"
  ).length;
  const executingCount = normalizedInitiatives.filter(
    (initiative) => initiative.status === "executing"
  ).length;
  const finalizedCount = normalizedInitiatives.filter(
    (initiative) => initiative.status === "finalized"
  ).length;

  const initiativeColumns = [
    {
      key: "name",
      header: "Initiative",
      render: (initiative: Initiative) => (
        <div>
          <p className="font-medium">{initiative.name}</p>
          {initiative.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {initiative.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Stage",
      render: (initiative: Initiative) => (
        <StatusBadge status={initiative.status} />
      ),
    },
    {
      key: "target_date",
      header: "Target Date",
      className: "hidden md:table-cell",
      render: (initiative: Initiative) => (
        <span className="text-muted-foreground">
          {initiative.target_date
            ? new Date(initiative.target_date).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      key: "completion_date",
      header: "Finalized On",
      className: "hidden md:table-cell",
      render: (initiative: Initiative) => (
        <span className="text-muted-foreground">
          {initiative.status === "finalized" && initiative.completion_date
            ? new Date(initiative.completion_date).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
  ];

  const finalDocumentColumns = [
    {
      key: "title",
      header: "Document",
      render: (document: ResearchDocumentWithRelations) => (
        <div>
          <p className="font-medium">{document.title}</p>
          {document.summary && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {document.summary}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "initiative",
      header: "Initiative",
      className: "hidden md:table-cell",
      render: (document: ResearchDocumentWithRelations) => (
        <span className="text-muted-foreground">
          {document.initiative?.name || "Standalone"}
        </span>
      ),
    },
    {
      key: "author",
      header: "Owner",
      className: "hidden lg:table-cell",
      render: (document: ResearchDocumentWithRelations) => (
        <span className="text-muted-foreground">
          {document.author
            ? `${document.author.name} (${formatRole(document.author.role)})`
            : "—"}
        </span>
      ),
    },
    {
      key: "updated_at",
      header: "Updated",
      className: "text-right",
      render: (document: ResearchDocumentWithRelations) => (
        <span className="font-medium">
          {new Date(document.updated_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowCreateDocument(true)}>
              <BookOpen className="mr-1.5 size-4" />
              Save Document
            </Button>
            <Button size="sm" onClick={() => setShowCreateInitiative(true)}>
              <Plus className="mr-1.5 size-4" />
              New Initiative
            </Button>
          </div>
        }
      />

      <div className="flex-1 space-y-8 p-6">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Suggested"
              value={initiativesLoading ? "..." : suggestedCount}
              subtitle="Ideas under review"
              icon={FlaskConical}
            />
            <StatCard
              title="Approved"
              value={initiativesLoading ? "..." : approvedCount}
              subtitle="Cleared to execute"
              icon={ClipboardCheck}
            />
            <StatCard
              title="Executing"
              value={initiativesLoading ? "..." : executingCount}
              subtitle="Active research work"
              icon={Rocket}
            />
            <StatCard
              title="Finalized"
              value={initiativesLoading ? "..." : finalizedCount}
              subtitle="Finalized initiatives"
              icon={CheckCircle2}
            />
            <StatCard
              title="Final Drive Docs"
              value={documentsLoading ? "..." : finalDocuments?.length || 0}
              subtitle="Canonical research artifacts"
              icon={BookOpen}
            />
          </div>

          <div className="overflow-x-auto">
            <div className="flex w-max items-center gap-1 rounded-lg bg-muted p-1">
              {[
                { key: "all" as const, label: `All (${normalizedInitiatives.length})` },
                { key: "suggested" as const, label: `Suggested (${suggestedCount})` },
                { key: "approved" as const, label: `Approved (${approvedCount})` },
                { key: "executing" as const, label: `Executing (${executingCount})` },
                { key: "finalized" as const, label: `Finalized (${finalizedCount})` },
                {
                  key: "archived" as const,
                  label: `Archived (${
                    normalizedInitiatives.filter((item) => item.status === "archived")
                      .length
                  })`,
                },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    tab === item.key
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {initiativesLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Loading research initiatives...
            </div>
          ) : filteredInitiatives.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title={
                tab === "all"
                  ? "No research initiatives yet"
                  : "No initiatives in this stage"
              }
              description={
                tab === "all"
                  ? "Create initiatives to move work from suggestion to finalization."
                  : "Switch stages to review the full research pipeline."
              }
              action={
                <Button size="sm" onClick={() => setShowCreateInitiative(true)}>
                  <Plus className="mr-1.5 size-4" />
                  New Initiative
                </Button>
              }
            />
          ) : (
            <DataTable
              data={filteredInitiatives}
              columns={initiativeColumns}
              searchKey="name"
              searchPlaceholder="Search initiatives..."
              onRowClick={(initiative) => router.push(`/initiatives/${initiative.id}`)}
            />
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Final Research Drive
            </h2>
            <Button size="sm" variant="outline" onClick={() => setShowCreateDocument(true)}>
              <BookOpen className="mr-1.5 size-4" />
              Save Document
            </Button>
          </div>

          {!finalDocuments || finalDocuments.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No final research documents yet"
              description="Finalize initiatives, then store their canonical outputs here."
              action={
                <Button size="sm" onClick={() => setShowCreateDocument(true)}>
                  <BookOpen className="mr-1.5 size-4" />
                  Add Final Document
                </Button>
              }
            />
          ) : (
            <DataTable
              data={finalDocuments}
              columns={finalDocumentColumns}
              searchKey="title"
              searchPlaceholder="Search final documents..."
              onRowClick={(document) => setEditingDocument(document)}
            />
          )}
        </section>
      </div>

      <Dialog open={showCreateInitiative} onOpenChange={setShowCreateInitiative}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Research Initiative</DialogTitle>
            <DialogDescription className="sr-only">
              Create a new initiative and place it into the research pipeline.
            </DialogDescription>
          </DialogHeader>
          <InitiativeForm
            onSuccess={() => {
              setShowCreateInitiative(false);
              mutateInitiatives();
            }}
            onCancel={() => setShowCreateInitiative(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDocument} onOpenChange={setShowCreateDocument}>
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save To Research Drive</DialogTitle>
            <DialogDescription className="sr-only">
              Save a research artifact for durable project context.
            </DialogDescription>
          </DialogHeader>
          <ResearchDocumentForm
            onSuccess={() => {
              setShowCreateDocument(false);
              mutateDocuments();
            }}
            onCancel={() => setShowCreateDocument(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingDocument}
        onOpenChange={(open) => !open && setEditingDocument(null)}
      >
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Research Document</DialogTitle>
            <DialogDescription className="sr-only">
              Update a final-drive research document.
            </DialogDescription>
          </DialogHeader>
          {editingDocument && (
            <ResearchDocumentForm
              document={editingDocument}
              onSuccess={() => {
                setEditingDocument(null);
                mutateDocuments();
              }}
              onCancel={() => setEditingDocument(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
