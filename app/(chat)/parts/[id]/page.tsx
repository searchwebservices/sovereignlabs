"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, MapPin, Tag, Package } from "lucide-react";
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
import { PartForm } from "@/components/lab/part-form";
import { usePart } from "@/hooks/use-parts";
import { partsApi } from "@/lib/supabase/api";
import { getPartCategoryIcon, getPartCategoryLabel } from "@/lib/lab-icons";
import { getDeviceTypeIcon } from "@/lib/lab-icons";
import type { PartStatus } from "@/lib/types/lab";

export default function PartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: part, isLoading, mutate } = usePart(id);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await partsApi.delete(id);
      toast.success("Part deleted");
      router.push("/parts");
    } catch {
      toast.error("Failed to delete part");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading part...
      </div>
    );
  }

  if (!part) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Part not found
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        title={part.name}
        subtitle={part.category ? getPartCategoryLabel(part.category) : undefined}
        icon={getPartCategoryIcon(part.category)}
        backHref="/parts"
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
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={part.status as PartStatus} />
            {part.description && (
              <p className="text-sm text-muted-foreground">
                {part.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 text-sm">
              <Tag className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{part.category ? getPartCategoryLabel(part.category) : "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-medium">{part.quantity}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{part.location || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Unit Cost:</span>
              <span className="font-medium">
                {part.unit_cost
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(part.unit_cost)
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Attached Device */}
        {part.device && (() => {
          const DeviceIcon = getDeviceTypeIcon(part.device.type);
          return (
          <div className="rounded-xl border bg-card">
            <div className="border-b px-5 py-3">
              <h2 className="text-sm font-semibold">Attached Device</h2>
            </div>
            <Link
              href={`/devices/${part.device.id}`}
              className="flex items-center gap-3 px-5 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="rounded-lg bg-muted p-2">
                <DeviceIcon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{part.device.name}</p>
                <p className="text-xs text-muted-foreground">
                  {part.device.location || "No location"}
                </p>
              </div>
              <div className="ml-auto">
                <StatusBadge status={part.device.status} />
              </div>
            </Link>
          </div>
          );
        })()}
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
          </DialogHeader>
          <PartForm
            part={part}
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
            <AlertDialogTitle>Delete part?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{part.name}&quot; and cannot be
              undone.
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
    </div>
  );
}
