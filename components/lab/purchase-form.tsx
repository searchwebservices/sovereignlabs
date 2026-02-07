"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { purchasesApi } from "@/lib/supabase/api";
import { useTeamMembers } from "@/hooks/use-team-members";
import { useDevices } from "@/hooks/use-devices";
import { useParts } from "@/hooks/use-parts";
import type {
  Purchase,
  PurchaseStatus,
  TaskPriority,
} from "@/lib/types/lab";

interface PurchaseFormProps {
  purchase?: Purchase;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PurchaseForm({
  purchase,
  onSuccess,
  onCancel,
}: PurchaseFormProps) {
  const { mutate } = useSWRConfig();
  const { data: teamMembers } = useTeamMembers();
  const { data: devices } = useDevices();
  const { data: parts } = useParts();
  const [loading, setLoading] = useState(false);

  const [itemName, setItemName] = useState(purchase?.item_name || "");
  const [description, setDescription] = useState(
    purchase?.description || ""
  );
  const [quantity, setQuantity] = useState(
    purchase?.quantity?.toString() || "1"
  );
  const [estimatedCost, setEstimatedCost] = useState(
    purchase?.estimated_cost?.toString() || ""
  );
  const [vendor, setVendor] = useState(purchase?.vendor || "");
  const [status, setStatus] = useState<PurchaseStatus>(
    purchase?.status || "needed"
  );
  const [priority, setPriority] = useState<TaskPriority>(
    purchase?.priority || "medium"
  );
  const [linkedDeviceId, setLinkedDeviceId] = useState(
    purchase?.linked_device_id || ""
  );
  const [linkedPartId, setLinkedPartId] = useState(
    purchase?.linked_part_id || ""
  );
  const [requestedBy, setRequestedBy] = useState(
    purchase?.requested_by || ""
  );
  const [notes, setNotes] = useState(purchase?.notes || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      toast.error("Item name is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        item_name: itemName.trim(),
        description: description.trim() || null,
        quantity: parseInt(quantity) || 1,
        estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
        vendor: vendor.trim() || null,
        status,
        priority,
        linked_device_id: linkedDeviceId || null,
        linked_part_id: linkedPartId || null,
        requested_by: requestedBy || null,
        notes: notes.trim() || null,
      };

      if (purchase) {
        await purchasesApi.update(purchase.id, payload);
        toast.success("Purchase updated");
      } else {
        await purchasesApi.create(payload);
        toast.success("Purchase created");
      }

      mutate(
        (key: string) =>
          typeof key === "string" && key.startsWith("lab:purchase"),
        undefined,
        { revalidate: true }
      );
      onSuccess?.();
    } catch {
      toast.error(
        purchase
          ? "Failed to update purchase"
          : "Failed to create purchase"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="itemName">Item Name *</Label>
          <Input
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g. Raspberry Pi 5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor / URL</Label>
          <Input
            id="vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. Amazon, Digikey"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedCost">Est. Unit Cost ($)</Label>
          <Input
            id="estimatedCost"
            type="number"
            step="0.01"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as PurchaseStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="needed">Needed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as TaskPriority)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestedBy">Requested By</Label>
          <Select value={requestedBy} onValueChange={setRequestedBy}>
            <SelectTrigger>
              <SelectValue placeholder="Select person..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {(teamMembers || []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedDevice">Link to Device</Label>
          <Select value={linkedDeviceId} onValueChange={setLinkedDeviceId}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {(devices || []).map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedPart">Link to Part</Label>
          <Select value={linkedPartId} onValueChange={setLinkedPartId}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {(parts || []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this for?"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : purchase
              ? "Update Purchase"
              : "Add Purchase"}
        </Button>
      </div>
    </form>
  );
}
