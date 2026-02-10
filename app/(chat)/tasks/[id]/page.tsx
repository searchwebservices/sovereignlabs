// app/(chat)/tasks/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTask } from "@/hooks/use-tasks";
import { StatusBadge } from "@/components/lab/status-badge";
import { PriorityBadge } from "@/components/lab/priority-badge";

interface TaskDetailsPageProps {
  params: { id: string };
}

export default function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const router = useRouter();
  const { data: task, isLoading, mutate } = useTask(params.id);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "todo");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || "");
  const [dueDate, setDueDate] = useState(task?.due_date || "");

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      // Here you would typically call an API to update the task
      // For now, we'll just simulate a successful update
      toast.success("Task updated successfully");
      setEditing(false);
      mutate();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Loading task details...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Task not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Details</h1>
        <Button variant="outline" onClick={() => router.back()}>Back to Tasks</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editing ? <Input value={title} onChange={(e) => setTitle(e.target.value)} /> : task.title}</CardTitle>
          <div className="flex gap-2">
            <StatusBadge status={task.status as any} />
            <PriorityBadge priority={task.priority as any} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Assigned To</Label>
                <p>{task.assignee?.name || "Unassigned"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Due Date</Label>
                <p>{task.due_date || "—"}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Description</Label>
              {editing ? (
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
              ) : (
                <p className="whitespace-pre-wrap">{task.description || "No description"}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save</Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>Edit</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-tasks Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sub-tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No sub-tasks yet.</p>
        </CardContent>
      </Card>

      {/* Attached Files Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Attached Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No files attached.</p>
        </CardContent>
      </Card>

      {/* Associated Meetings Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Associated Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No meetings associated.</p>
        </CardContent>
      </Card>
    </div>
  );
}