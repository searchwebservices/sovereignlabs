"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  Pencil,
  Trash2,
  Calendar,
  Cpu,
  Puzzle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LabPageHeader } from "@/components/lab/lab-page-header";
import { StatusBadge } from "@/components/lab/status-badge";
import { InitiativeForm } from "@/components/lab/initiative-form";
import { ResearchDocumentForm } from "@/components/lab/research-document-form";
import { useInitiative } from "@/hooks/use-initiatives";
import { initiativesApi } from "@/lib/supabase/api";
import type { InitiativeStatus } from "@/lib/types/lab";

export default function InitiativeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: initiative, isLoading, mutate } = useInitiative(id);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);

  const handleDelete = async () => {
    try {
      await initiativesApi.delete(id);
      toast.success("Initiative deleted");
      router.push("/initiatives");
    } catch {
      toast.error("Failed to delete initiative");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading initiative...
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Initiative not found
      </div>
    );
  }

  const devices = initiative.initiative_devices || [];
  const parts = initiative.initiative_parts || [];
  const researchDocuments = initiative.research_documents || [];
  const isFinalized = initiative.status === "finalized";

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        backHref="/initiatives"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdit(true)}
            >
              <Pencil className="mr-1.5 size-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Overview */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={initiative.status as InitiativeStatus} />
            {initiative.description && (
              <p className="text-sm text-muted-foreground">
                {initiative.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Start:</span>
              <span className="font-medium">
                {initiative.start_date
                  ? new Date(initiative.start_date).toLocaleDateString()
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Target:</span>
              <span className="font-medium">
                {initiative.target_date
                  ? new Date(initiative.target_date).toLocaleDateString()
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Finalized:</span>
              <span className="font-medium">
                {initiative.completion_date
                  ? new Date(
                      initiative.completion_date
                    ).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Assigned Devices */}
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="text-sm font-semibold">
                Assigned Devices ({devices.length})
              </h2>
            </div>
            <div className="divide-y">
              {devices.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No devices assigned
                </div>
              ) : (
                devices.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/devices/${assignment.device.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="rounded-lg bg-muted p-1.5">
                      <Cpu className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {assignment.device.name}
                      </p>
                      {assignment.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {assignment.notes}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={assignment.device.status} />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Assigned Parts */}
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h2 className="text-sm font-semibold">
                Assigned Parts ({parts.length})
              </h2>
            </div>
            <div className="divide-y">
              {parts.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No parts assigned
                </div>
              ) : (
                parts.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/parts/${assignment.part.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="rounded-lg bg-muted p-1.5">
                      <Puzzle className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {assignment.part.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {assignment.quantity_dedicated}
                        {assignment.notes && ` · ${assignment.notes}`}
                      </p>
                    </div>
                    <StatusBadge status={assignment.part.status} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-sm font-semibold">
              Research Drive Documents ({researchDocuments.length})
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddDocument(true)}
              disabled={!isFinalized}
            >
              <BookOpen className="mr-1.5 size-4" />
              Add Document
            </Button>
          </div>
          {!isFinalized ? (
            <p className="px-5 py-5 text-sm text-muted-foreground">
              Finalize this initiative to start storing canonical research
              documents in the drive.
            </p>
          ) : researchDocuments.length === 0 ? (
            <p className="px-5 py-5 text-sm text-muted-foreground">
              No research-drive documents yet.
            </p>
          ) : (
            <div className="divide-y">
              {researchDocuments.map((document) => (
                <div key={document.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{document.title}</p>
                  {document.summary && (
                    <p className="text-xs text-muted-foreground">
                      {document.summary}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Status: <StatusBadge status={document.status} />
                  </p>
                  {document.storage_url && (
                    <a
                      href={document.storage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Open document
                    </a>
                  )}
                  {!document.storage_url && document.drive_file_id && (
                    <a
                      href={`/api/drive/files/${document.drive_file_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Open document
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Initiative</DialogTitle>
          </DialogHeader>
          <InitiativeForm
            initiative={initiative}
            onSuccess={() => {
              setShowEdit(false);
              mutate();
            }}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete initiative?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{initiative.name}&quot; and
              all its device/part assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showAddDocument} onOpenChange={setShowAddDocument}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Save To Research Drive</DialogTitle>
          </DialogHeader>
          <ResearchDocumentForm
            defaultInitiativeId={initiative.id}
            onSuccess={() => {
              setShowAddDocument(false);
              mutate();
            }}
            onCancel={() => setShowAddDocument(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
