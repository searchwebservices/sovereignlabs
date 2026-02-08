"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, MapPin, Hash, Calendar, DollarSign, Tag } from "lucide-react";
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
import { DeviceForm } from "@/components/lab/device-form";
import { useDevice } from "@/hooks/use-devices";
import { devicesApi } from "@/lib/supabase/api";
import { getDeviceTypeLabel } from "@/lib/lab-icons";
import { getPartCategoryIcon } from "@/lib/lab-icons";
import type { DeviceStatus } from "@/lib/types/lab";

export default function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: device, isLoading, mutate } = useDevice(id);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await devicesApi.delete(id);
      toast.success("Device deleted");
      router.push("/devices");
    } catch {
      toast.error("Failed to delete device");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading device...
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Device not found
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        backHref="/devices"
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
        {/* Status + Description */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={device.status as DeviceStatus} />
            {device.description && (
              <p className="text-sm text-muted-foreground">
                {device.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {device.type && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{getDeviceTypeLabel(device.type)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{device.location || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Hash className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Serial:</span>
              <span className="font-medium font-mono">
                {device.serial_number || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Cost:</span>
              <span className="font-medium">
                {device.cost
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(device.cost)
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Purchased:</span>
              <span className="font-medium">
                {device.purchase_date
                  ? new Date(device.purchase_date).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Attached Parts */}
        <div className="rounded-xl border bg-card">
          <div className="border-b px-5 py-3">
            <h2 className="text-sm font-semibold">Attached Parts</h2>
          </div>
          <div className="divide-y">
            {device.parts && device.parts.length > 0 ? (
              device.parts.map((part) => {
                const PartIcon = getPartCategoryIcon(part.category);
                return (
                <div
                  key={part.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <PartIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{part.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {part.category || "No category"} &middot; Qty:{" "}
                        {part.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {part.unit_cost
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(part.unit_cost * part.quantity)
                      : "—"}
                  </span>
                </div>
                );
              })
            ) : (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                No parts attached to this device
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
          </DialogHeader>
          <DeviceForm
            device={device}
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
            <AlertDialogTitle>Delete device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{device.name}&quot; and cannot
              be undone.
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
