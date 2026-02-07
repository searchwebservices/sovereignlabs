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
import { devicesApi } from "@/lib/supabase/api";
import { DEVICE_TYPES, getDeviceTypeIcon } from "@/lib/lab-icons";
import type { Device, DeviceStatus } from "@/lib/types/lab";

interface DeviceFormProps {
  device?: Device;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DeviceForm({ device, onSuccess, onCancel }: DeviceFormProps) {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(device?.name || "");
  const [type, setType] = useState(device?.type || "");
  const [description, setDescription] = useState(device?.description || "");
  const [status, setStatus] = useState<DeviceStatus>(device?.status || "available");
  const [location, setLocation] = useState(device?.location || "");
  const [serialNumber, setSerialNumber] = useState(device?.serial_number || "");
  const [cost, setCost] = useState(device?.cost?.toString() || "");
  const [purchaseDate, setPurchaseDate] = useState(device?.purchase_date || "");

  const SelectedIcon = type ? getDeviceTypeIcon(type) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        type: type || null,
        description: description.trim() || null,
        status,
        location: location.trim() || null,
        serial_number: serialNumber.trim() || null,
        cost: cost ? parseFloat(cost) : null,
        purchase_date: purchaseDate || null,
      };

      if (device) {
        await devicesApi.update(device.id, payload);
        toast.success("Device updated");
      } else {
        await devicesApi.create(payload);
        toast.success("Device created");
      }

      mutate((key: string) => typeof key === "string" && key.startsWith("lab:device"), undefined, { revalidate: true });
      onSuccess?.();
    } catch (err) {
      toast.error(device ? "Failed to update device" : "Failed to create device");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Robot Arm v2" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Device Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type...">
                {type && SelectedIcon && (
                  <span className="flex items-center gap-2">
                    <SelectedIcon className="size-4 shrink-0 text-muted-foreground" />
                    {DEVICE_TYPES.find((t) => t.value === type)?.label}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {DEVICE_TYPES.map((dt) => {
                const Icon = dt.icon;
                return (
                  <SelectItem key={dt.value} value={dt.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      {dt.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as DeviceStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in_use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lab Room A" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serial">Serial Number</Label>
          <Input id="serial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="e.g. SN-12345" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Cost ($)</Label>
          <Input id="cost" type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input id="purchaseDate" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
        </div>
      </div>
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
          {loading ? "Saving..." : device ? "Update Device" : "Create Device"}
        </Button>
      </div>
    </form>
  );
}
