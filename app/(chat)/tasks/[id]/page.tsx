"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  CheckSquare,
  Clock3,
  Link as LinkIcon,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { LabPageHeader } from "@/components/lab/lab-page-header";
import { PriorityBadge } from "@/components/lab/priority-badge";
import { StatusBadge } from "@/components/lab/status-badge";
import { TaskForm } from "@/components/lab/task-form";
import { useTask } from "@/hooks/use-tasks";
import { useTeamMembers } from "@/hooks/use-team-members";
import {
  taskFilesApi,
  taskMeetingsApi,
  taskMentionsApi,
  taskSubtasksApi,
  tasksApi,
} from "@/lib/supabase/api";
import { AI_ASSISTANT_MEMBER_ID } from "@/lib/constants";
import type { TaskMentionStatus, TaskPriority, TaskStatus } from "@/lib/types/lab";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function getDueDateState(value: string | null): {
  label: string;
  className: string;
} {
  if (!value) return { label: "—", className: "text-foreground" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(value);
  due.setHours(0, 0, 0, 0);
  const diff = due.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      label: `${formatDate(value)} (overdue)`,
      className: "text-red-600 dark:text-red-400",
    };
  }
  if (days === 0) {
    return { label: "Today", className: "text-amber-600 dark:text-amber-400" };
  }
  if (days === 1) {
    return {
      label: "Tomorrow",
      className: "text-amber-600 dark:text-amber-400",
    };
  }

  return { label: formatDate(value), className: "text-foreground" };
}

export default function TaskDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: task, isLoading, mutate } = useTask(id);
  const { data: teamMembers } = useTeamMembers();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskAssignee, setSubtaskAssignee] = useState("");
  const [subtaskDueDate, setSubtaskDueDate] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);

  const [fileName, setFileName] = useState("");
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [addingFile, setAddingFile] = useState(false);

  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [addingMeeting, setAddingMeeting] = useState(false);

  const [mentionMemberId, setMentionMemberId] = useState("");
  const [mentionContext, setMentionContext] = useState("");
  const [addingMention, setAddingMention] = useState(false);

  const aiMember = useMemo(
    () =>
      (teamMembers || []).find(
        (member) => member.id === AI_ASSISTANT_MEMBER_ID || member.is_ai
      ),
    [teamMembers]
  );

  const handleDelete = async () => {
    try {
      await tasksApi.delete(id);
      toast.success("Task deleted");
      router.push("/tasks");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleAddSubtask = async () => {
    if (!task) return;
    if (!subtaskTitle.trim()) {
      toast.error("Subtask title is required");
      return;
    }

    setAddingSubtask(true);
    try {
      await taskSubtasksApi.create({
        task_id: task.id,
        title: subtaskTitle.trim(),
        is_done: false,
        assigned_to: subtaskAssignee || null,
        due_date: subtaskDueDate || null,
        order_index: (task.subtasks || []).length,
      });
      setSubtaskTitle("");
      setSubtaskAssignee("");
      setSubtaskDueDate("");
      toast.success("Subtask added");
      mutate();
    } catch {
      toast.error("Failed to add subtask");
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, isDone: boolean) => {
    try {
      await taskSubtasksApi.update(subtaskId, { is_done: !isDone });
      mutate();
    } catch {
      toast.error("Failed to update subtask");
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await taskSubtasksApi.delete(subtaskId);
      toast.success("Subtask removed");
      mutate();
    } catch {
      toast.error("Failed to remove subtask");
    }
  };

  const handleAddFile = async () => {
    if (!task) return;
    if (!fileUpload) {
      toast.error("Select a file to upload");
      return;
    }

    setAddingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", fileUpload);
      formData.append("scope", "task_attachment");
      formData.append("isPublic", "false");

      const uploadResponse = await fetch("/api/drive/files", {
        method: "POST",
        body: formData,
      });
      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok || !uploadResult?.data) {
        throw new Error(uploadResult?.error?.message || "Upload failed");
      }

      await taskFilesApi.create({
        task_id: task.id,
        name: fileName.trim() || uploadResult.data.name,
        url:
          uploadResult.data.downloadUrl ||
          `/api/drive/files/${uploadResult.data.id}`,
        content_type: uploadResult.data.content_type || null,
        file_size: uploadResult.data.size_bytes || null,
        drive_file_id: uploadResult.data.id,
        uploaded_by: task.assigned_to || null,
      });
      setFileName("");
      setFileUpload(null);
      toast.success("Attachment added");
      mutate();
    } catch {
      toast.error("Failed to add attachment");
    } finally {
      setAddingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await taskFilesApi.delete(fileId);
      toast.success("Attachment removed");
      mutate();
    } catch {
      toast.error("Failed to remove attachment");
    }
  };

  const handleAddMeeting = async () => {
    if (!task) return;
    if (!meetingTitle.trim()) {
      toast.error("Meeting title is required");
      return;
    }

    setAddingMeeting(true);
    try {
      await taskMeetingsApi.create({
        task_id: task.id,
        title: meetingTitle.trim(),
        meeting_date: meetingDate ? new Date(meetingDate).toISOString() : null,
        meeting_url: meetingUrl.trim() || null,
        notes: meetingNotes.trim() || null,
      });
      setMeetingTitle("");
      setMeetingDate("");
      setMeetingUrl("");
      setMeetingNotes("");
      toast.success("Meeting linked");
      mutate();
    } catch {
      toast.error("Failed to add meeting");
    } finally {
      setAddingMeeting(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      await taskMeetingsApi.delete(meetingId);
      toast.success("Meeting removed");
      mutate();
    } catch {
      toast.error("Failed to remove meeting");
    }
  };

  const handleAddMention = async (memberId: string, context: string) => {
    if (!task) return;
    if (!memberId) {
      toast.error("Select a member to mention");
      return;
    }

    const existing = (task.mentions || []).find(
      (mention) => mention.member_id === memberId
    );

    if (existing) {
      toast.error("This member is already tagged");
      return;
    }

    setAddingMention(true);
    try {
      await taskMentionsApi.create({
        task_id: task.id,
        member_id: memberId,
        context: context.trim() || null,
        status: "new",
      });
      setMentionMemberId("");
      setMentionContext("");
      toast.success("Member tagged");
      mutate();
    } catch {
      toast.error("Failed to tag member");
    } finally {
      setAddingMention(false);
    }
  };

  const handleTagAi = async () => {
    if (!aiMember) {
      toast.error("AI assistant member is not configured");
      return;
    }
    await handleAddMention(
      aiMember.id,
      mentionContext || "Please review and assist with this task."
    );
  };

  const handleMentionStatusChange = async (
    mentionId: string,
    status: TaskMentionStatus
  ) => {
    try {
      await taskMentionsApi.update(mentionId, { status });
      mutate();
    } catch {
      toast.error("Failed to update mention");
    }
  };

  const handleDeleteMention = async (mentionId: string) => {
    try {
      await taskMentionsApi.delete(mentionId);
      toast.success("Mention removed");
      mutate();
    } catch {
      toast.error("Failed to remove mention");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading task...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Task not found
      </div>
    );
  }

  const dueDate = getDueDateState(task.due_date);
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((subtask) => subtask.is_done).length;
  const meetings = task.meetings || [];
  const files = task.files || [];
  const mentions = task.mentions || [];

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        backHref="/tasks"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
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

      <div className="flex-1 space-y-6 p-6">
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-semibold">{task.title}</h1>
            <StatusBadge status={task.status as TaskStatus} />
            <PriorityBadge priority={task.priority as TaskPriority} />
          </div>

          <p className="text-sm text-muted-foreground">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Assignee
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <User className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {task.assignee?.name || "Unassigned"}
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Due Date
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span className={`font-medium ${dueDate.className}`}>
                {dueDate.label}
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Subtasks
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <CheckSquare className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {completedSubtasks}/{subtasks.length} complete
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Updated
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Clock3 className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {formatDateTime(task.updated_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Tagged Members</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTagAi}
              disabled={addingMention || !aiMember}
            >
              <Users className="mr-1.5 size-4" />
              Tag AI Assistant
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="mention-member">Member</Label>
              <Select
                value={mentionMemberId || "__none__"}
                onValueChange={(value) =>
                  setMentionMemberId(value === "__none__" ? "" : value)
                }
              >
                <SelectTrigger id="mention-member">
                  <SelectValue placeholder="Select member..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {(teamMembers || []).map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                      {member.is_ai ? " (AI)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="mention-context">Tag Context</Label>
              <Input
                id="mention-context"
                value={mentionContext}
                onChange={(e) => setMentionContext(e.target.value)}
                placeholder="What should they do?"
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => handleAddMention(mentionMemberId, mentionContext)}
            disabled={addingMention}
          >
            <Plus className="mr-1.5 size-4" />
            Add Mention
          </Button>

          {mentions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No members tagged on this task yet.
            </p>
          ) : (
            <div className="space-y-2">
              {mentions.map((mention) => (
                <div
                  key={mention.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {mention.member?.name || "Unknown member"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mention.context || "No context provided"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={mention.status} />
                    <Select
                      value={mention.status}
                      onValueChange={(value) =>
                        handleMentionStatusChange(
                          mention.id,
                          value as TaskMentionStatus
                        )
                      }
                    >
                      <SelectTrigger className="h-8 w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="seen">Seen</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteMention(mention.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Subtasks</h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="subtask-title">Title</Label>
              <Input
                id="subtask-title"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="e.g. Draft implementation checklist"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtask-assignee">Assignee</Label>
              <Select
                value={subtaskAssignee || "__none__"}
                onValueChange={(value) =>
                  setSubtaskAssignee(value === "__none__" ? "" : value)
                }
              >
                <SelectTrigger id="subtask-assignee">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {(teamMembers || []).map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtask-due-date">Due Date</Label>
              <Input
                id="subtask-due-date"
                type="date"
                value={subtaskDueDate}
                onChange={(e) => setSubtaskDueDate(e.target.value)}
              />
            </div>
          </div>

          <Button size="sm" onClick={handleAddSubtask} disabled={addingSubtask}>
            <Plus className="mr-1.5 size-4" />
            Add Subtask
          </Button>

          {subtasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subtasks yet.</p>
          ) : (
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={subtask.is_done}
                      onChange={() =>
                        handleToggleSubtask(subtask.id, subtask.is_done)
                      }
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          subtask.is_done ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {subtask.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subtask.assignee?.name || "Unassigned"}
                        {subtask.due_date
                          ? ` · Due ${new Date(subtask.due_date).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Attached Files</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="file-name">Name</Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Optional display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <Button size="sm" onClick={handleAddFile} disabled={addingFile}>
            <Paperclip className="mr-1.5 size-4" />
            Add Attachment
          </Button>

          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attachments yet.</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{file.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <LinkIcon className="size-3" />
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:underline"
                      >
                        {file.url}
                      </a>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteFile(file.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Associated Meetings</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meeting-title">Title</Label>
              <Input
                id="meeting-title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="e.g. Sprint sync"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-date">Date/Time</Label>
              <Input
                id="meeting-date"
                type="datetime-local"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="meeting-url">Meeting URL</Label>
              <Input
                id="meeting-url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="meeting-notes">Notes</Label>
              <Textarea
                id="meeting-notes"
                rows={2}
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Purpose, expected decisions, prep notes..."
              />
            </div>
          </div>

          <Button size="sm" onClick={handleAddMeeting} disabled={addingMeeting}>
            <Plus className="mr-1.5 size-4" />
            Link Meeting
          </Button>

          {meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No meetings linked.</p>
          ) : (
            <div className="space-y-2">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {meeting.meeting_date
                        ? new Date(meeting.meeting_date).toLocaleString()
                        : "No date set"}
                    </p>
                    {meeting.meeting_url && (
                      <a
                        href={meeting.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {meeting.meeting_url}
                      </a>
                    )}
                    {meeting.notes && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {meeting.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteMeeting(meeting.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription className="sr-only">
              Update task details and assignment.
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            task={task}
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
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{task.title}&quot; and all
              related subtasks/files/meetings/mentions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
