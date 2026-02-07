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
import { partsApi } from "@/lib/supabase/api";
import { useDevices } from "@/hooks/use-devices";
import { PART_CATEGORIES, getPartCategoryIcon } from "@/lib/lab-icons";
import type { Part, PartStatus } from "@/lib/types/lab";

interface PartFormProps {
  part?: Part;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PartForm({ part, onSuccess, onCancel }: PartFormProps) {
  const { mutate } = useSWRConfig();
  const { data: devices } = useDevices();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(part?.name || "");
  const [description, setDescription] = useState(part?.description || "");
  const [category, setCategory] = useState(part?.category || "");
  const [quantity, setQuantity] = useState(part?.quantity?.toString() || "1");
  const [unitCost, setUnitCost] = useState(part?.unit_cost?.toString() || "");
  const [status, setStatus] = useState<PartStatus>(part?.status || "spare");
  const [deviceId, setDeviceId] = useState<string>(part?.device_id || "");
  const [location, setLocation] = useState(part?.location || "");

  const SelectedCategoryIcon = category ? getPartCategoryIcon(category) : null;

  const handleStatusChange = (newStatus: PartStatus) => {
    setStatus(newStatus);
    if (newStatus === "spare") {
      setDeviceId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (status === "attached" && !deviceId) {
      toast.error("Please select a device to attach this part to");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        category: category || null,
        quantity: parseInt(quantity) || 1,
        unit_cost: unitCost ? parseFloat(unitCost) : null,
        status,
        device_id: status === "attached" ? deviceId : null,
        location: location.trim() || null,
      };

      if (part) {
        await partsApi.update(part.id, payload);
        toast.success("Part updated");
      } else {
        await partsApi.create(payload);
        toast.success("Part created");
      }

      mutate((key: string) => typeof key === "string" && key.startsWith("lab:part"), undefined, { revalidate: true });
      mutate((key: string) => typeof key === "string" && key.startsWith("lab:device"), undefined, { revalidate: true });
      onSuccess?.();
    } catch (err) {
      toast.error(part ? "Failed to update part" : "Failed to create part");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LiDAR Sensor" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category...">
                {category && SelectedCategoryIcon && (
                  <span className="flex items-center gap-2">
                    <SelectedCategoryIcon className="size-4 shrink-0 text-muted-foreground" />
                    {PART_CATEGORIES.find((c) => c.value === category)?.label}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PART_CATEGORIES.map((pc) => {
                const Icon = pc.icon;
                return (
                  <SelectItem key={pc.value} value={pc.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      {pc.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitCost">Unit Cost ($)</Label>
          <Input id="unitCost" type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => handleStatusChange(v as PartStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spare">Spare</SelectItem>
              <SelectItem value="attached">Attached</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {status === "attached" ? (
          <div className="space-y-2">
            <Label htmlFor="device">Attached To *</Label>
            <Select value={deviceId} onValueChange={setDeviceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a device..." />
              </SelectTrigger>
              <SelectContent>
                {devices && devices.length > 0 ? (
                  devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No devices available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Shelf B3" />
          </div>
        )}
      </div>
      {status === "attached" && (
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Shelf B3" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : part ? "Update Part" : "Create Part"}
        </Button>
      </div>
    </form>
  );
}
