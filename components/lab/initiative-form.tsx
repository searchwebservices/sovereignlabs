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
import { initiativesApi } from "@/lib/supabase/api";
import type { Initiative, InitiativeStatus } from "@/lib/types/lab";

interface InitiativeFormProps {
  initiative?: Initiative;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InitiativeForm({ initiative, onSuccess, onCancel }: InitiativeFormProps) {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(initiative?.name || "");
  const [description, setDescription] = useState(initiative?.description || "");
  const [status, setStatus] = useState<InitiativeStatus>(
    initiative?.status || "suggested"
  );
  const [startDate, setStartDate] = useState(initiative?.start_date || "");
  const [targetDate, setTargetDate] = useState(initiative?.target_date || "");

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
        description: description.trim() || null,
        status,
        start_date: startDate || null,
        target_date: targetDate || null,
        completion_date:
          status === "finalized"
            ? initiative?.completion_date || new Date().toISOString()
            : null,
      };

      if (initiative) {
        await initiativesApi.update(initiative.id, payload);
        toast.success("Initiative updated");
      } else {
        await initiativesApi.create(payload);
        toast.success("Initiative created");
      }

      mutate((key: string) => typeof key === "string" && key.startsWith("lab:initiative"), undefined, { revalidate: true });
      onSuccess?.();
    } catch (err) {
      toast.error(initiative ? "Failed to update initiative" : "Failed to create initiative");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Autonomous Navigation Research" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as InitiativeStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="suggested">Suggested</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="executing">Executing</SelectItem>
              <SelectItem value="finalized">Finalized</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetDate">Target Date</Label>
          <Input id="targetDate" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the research initiative..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initiative ? "Update Initiative" : "Create Initiative"}
        </Button>
      </div>
    </form>
  );
}
