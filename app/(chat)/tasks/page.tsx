"use client";

import { useState } from "react";
import { Plus, CheckSquare, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LabPageHeader } from "@/components/lab/lab-page-header";
import { DataTable } from "@/components/lab/data-table";
import { StatusBadge } from "@/components/lab/status-badge";
import { PriorityBadge } from "@/components/lab/priority-badge";
import { TaskForm } from "@/components/lab/task-form";
import { EmptyState } from "@/components/lab/empty-state";
import { useTasks } from "@/hooks/use-tasks";
import type { TaskWithAssignee, TaskStatus, TaskPriority } from "@/lib/types/lab";

export default function TasksPage() {
  const router = useRouter();
  const { data: tasks, isLoading, mutate } = useTasks();
  const { mutate: globalMutate } = useSWRConfig();
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithAssignee | null>(null);
  const [tab, setTab] = useState<"all" | "todo" | "in_progress" | "done">(
    "all"
  );

  const filtered =
    tab === "all"
      ? tasks || []
      : (tasks || []).filter((t) => t.status === tab);

  const todoCount = (tasks || []).filter((t) => t.status === "todo").length;
  const inProgressCount = (tasks || []).filter(
    (t) => t.status === "in_progress"
  ).length;
  const doneCount = (tasks || []).filter((t) => t.status === "done").length;

  const formatDueDate = (date: string | null) => {
    if (!date) return "—";
    const d = new Date(date + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    const formatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (days < 0) {
      return (
        <span className="text-red-600 dark:text-red-400 font-medium">
          {formatted} (overdue)
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="text-amber-600 dark:text-amber-400 font-medium">
          Today
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="text-amber-600 dark:text-amber-400">Tomorrow</span>
      );
    }
    return <span className="text-muted-foreground">{formatted}</span>;
  };

  const columns = [
    {
      key: "title",
      header: "Task",
      render: (t: TaskWithAssignee) => (
        <div>
          <span className="font-medium">{t.title}</span>
          {t.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {t.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t: TaskWithAssignee) => (
        <StatusBadge status={t.status as TaskStatus} />
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (t: TaskWithAssignee) => (
        <PriorityBadge priority={t.priority as TaskPriority} />
      ),
    },
    {
      key: "assignee",
      header: "Assignee",
      className: "hidden md:table-cell",
      render: (t: TaskWithAssignee) => (
        <span className="text-muted-foreground">
          {t.assignee?.name || "Unassigned"}
        </span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      className: "hidden md:table-cell",
      render: (t: TaskWithAssignee) => (
        <div className="flex items-center gap-1.5">
          {t.due_date && (
            <Calendar className="size-3.5 text-muted-foreground" />
          )}
          {formatDueDate(t.due_date)}
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 size-4" />
            Add Task
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-4">
        {/* Status tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
          {[
            { key: "all" as const, label: `All (${tasks?.length ?? 0})` },
            { key: "todo" as const, label: `To Do (${todoCount})` },
            {
              key: "in_progress" as const,
              label: `In Progress (${inProgressCount})`,
            },
            { key: "done" as const, label: `Done (${doneCount})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading tasks...
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks yet"
            description="Create your first task to start delegating work across the team."
            action={
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1.5 size-4" />
                Add Task
              </Button>
            }
          />
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            searchKey="title"
            searchPlaceholder="Search tasks..."
            onRowClick={(t) => router.push(`/tasks/${t.id}`)}
          />
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription className="sr-only">Fill in the details to create a new task.</DialogDescription>
          </DialogHeader>
          <TaskForm
            onSuccess={() => {
              setShowCreate(false);
              mutate();
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription className="sr-only">Modify the task details below.</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              task={editingTask}
              onSuccess={() => {
                setEditingTask(null);
                mutate();
              }}
              onCancel={() => setEditingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
