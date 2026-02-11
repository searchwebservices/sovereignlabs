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
import { teamMembersApi } from "@/lib/supabase/api";
import type { TeamMember } from "@/lib/types/lab";

interface MemberFormProps {
  member?: TeamMember;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const roleOptions = [
  "admin",
  "researcher",
  "developer",
  "engineer",
  "technician",
  "guest",
] as const;

export function MemberForm({ member, onSuccess, onCancel }: MemberFormProps) {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(member?.name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [role, setRole] = useState(
    member?.role && roleOptions.includes(member.role as (typeof roleOptions)[number])
      ? member.role
      : ""
  );

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
        email: email.trim() || null,
        role: role || null,
      };

      if (member) {
        await teamMembersApi.update(member.id, payload);
        toast.success("Member updated");
      } else {
        await teamMembersApi.create(payload);
        toast.success("Member added");
      }

      mutate("lab:team-members");
      onSuccess?.();
    } catch {
      toast.error(member ? "Failed to update member" : "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ada Lovelace"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@sovereignlabs.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={role || "__none__"} onValueChange={(v) => setRole(v === "__none__" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select role..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No role</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="researcher">Researcher</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="engineer">Engineer</SelectItem>
            <SelectItem value="technician">Technician</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : member ? "Update Member" : "Add Member"}
        </Button>
      </div>
    </form>
  );
}
