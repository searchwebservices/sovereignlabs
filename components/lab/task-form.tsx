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
import { tasksApi } from "@/lib/supabase/api";
import { useTeamMembers } from "@/hooks/use-team-members";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types/lab";

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const { mutate } = useSWRConfig();
  const { data: teamMembers } = useTeamMembers();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<TaskStatus>(task?.status || "todo");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "medium"
  );
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || "");
  const [dueDate, setDueDate] = useState(task?.due_date || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
      };

      if (task) {
        await tasksApi.update(task.id, payload);
        toast.success("Task updated");
      } else {
        await tasksApi.create(payload);
        toast.success("Task created");
      }

      mutate(
        (key: string) =>
          typeof key === "string" && key.startsWith("lab:task"),
        undefined,
        { revalidate: true }
      );
      onSuccess?.();
    } catch {
      toast.error(task ? "Failed to update task" : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Set up MQTT broker on Pixel 3"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as TaskStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
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
          <Label htmlFor="assignedTo">Assign To</Label>
          <Select value={assignedTo || "__none__"} onValueChange={(v) => setAssignedTo(v === "__none__" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Unassigned</SelectItem>
              {(teamMembers || []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                  {m.is_ai ? " (AI)" : ""}
                  {m.role ? ` (${m.role})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
