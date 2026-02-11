"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BadgeCheck,
  CheckSquare,
  MessageSquareDot,
  Plus,
  ShoppingCart,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
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
import { LabPageHeader } from "@/components/lab/lab-page-header";
import { DataTable } from "@/components/lab/data-table";
import { EmptyState } from "@/components/lab/empty-state";
import { MemberForm } from "@/components/lab/member-form";
import { StatCard } from "@/components/lab/stat-card";
import { StatusBadge } from "@/components/lab/status-badge";
import { useTaskMentionsByMember } from "@/hooks/use-task-mentions";
import { useTeamMembers } from "@/hooks/use-team-members";
import { useTasks } from "@/hooks/use-tasks";
import { usePurchases } from "@/hooks/use-purchases";
import { teamMembersApi } from "@/lib/supabase/api";
import { AI_ASSISTANT_MEMBER_ID } from "@/lib/constants";
import type { TeamMember } from "@/lib/types/lab";

function formatRole(role: string | null): string {
  if (!role) return "Unassigned";
  return role
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default function MembersPage() {
  const router = useRouter();
  const { data: members, isLoading, mutate } = useTeamMembers();
  const { data: tasks } = useTasks();
  const { data: purchases } = usePurchases();
  const aiMember =
    (members || []).find(
      (member) => member.id === AI_ASSISTANT_MEMBER_ID || member.is_ai
    ) || null;
  const { data: aiMentions } = useTaskMentionsByMember(
    aiMember?.id || null,
    ["new", "seen"]
  );
  const [showCreate, setShowCreate] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);

  const getOpenTaskCount = (memberId: string) =>
    (tasks || []).filter(
      (task) => task.assigned_to === memberId && task.status !== "done"
    ).length;

  const getPendingPurchaseCount = (memberId: string) =>
    (purchases || []).filter(
      (purchase) =>
        purchase.requested_by === memberId &&
        purchase.status !== "received" &&
        purchase.status !== "cancelled"
    ).length;

  const openTaskTotal = (tasks || []).filter((task) => task.status !== "done")
    .length;
  const pendingPurchaseTotal = (purchases || []).filter(
    (purchase) =>
      purchase.status !== "received" && purchase.status !== "cancelled"
  ).length;

  const handleDelete = async () => {
    if (!deletingMember) return;
    if (deletingMember.is_ai || deletingMember.id === AI_ASSISTANT_MEMBER_ID) {
      toast.error("AI assistant member cannot be deleted");
      return;
    }

    try {
      await teamMembersApi.delete(deletingMember.id);
      toast.success("Member deleted");
      setDeletingMember(null);
      mutate();
    } catch {
      toast.error("Failed to delete member");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Member",
      render: (member: TeamMember) => (
        <div>
          <p className="font-medium">{member.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {member.email || "No email"}
          </p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (member: TeamMember) => (
        <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {formatRole(member.role)}
        </span>
      ),
    },
    {
      key: "open_tasks",
      header: "Open Tasks",
      className: "hidden md:table-cell",
      render: (member: TeamMember) => (
        <span className="text-muted-foreground">
          {getOpenTaskCount(member.id)}
        </span>
      ),
    },
    {
      key: "pending_requests",
      header: "Pending Purchases",
      className: "hidden md:table-cell",
      render: (member: TeamMember) => (
        <span className="text-muted-foreground">
          {getPendingPurchaseCount(member.id)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (member: TeamMember) => (
        member.is_ai || member.id === AI_ASSISTANT_MEMBER_ID ? (
          <span className="text-xs text-muted-foreground">System</span>
        ) : (
          <Button
            type="button"
            aria-label={`Delete ${member.name}`}
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingMember(member);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <LabPageHeader
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 size-4" />
            Add Member
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Team Members"
            value={isLoading ? "..." : members?.length || 0}
            subtitle="People in lab operations"
            icon={Users}
          />
          <StatCard
            title="Defined Roles"
            value={
              isLoading
                ? "..."
                : (members || []).filter((member) => !!member.role).length
            }
            subtitle="Members with assigned roles"
            icon={BadgeCheck}
          />
          <StatCard
            title="Open Tasks"
            value={isLoading ? "..." : openTaskTotal}
            subtitle="Assigned and in progress"
            icon={CheckSquare}
          />
          <StatCard
            title="Pending Purchases"
            value={isLoading ? "..." : pendingPurchaseTotal}
            subtitle="Requests awaiting completion"
            icon={ShoppingCart}
          />
          <StatCard
            title="AI Mentions"
            value={isLoading ? "..." : aiMentions?.length || 0}
            subtitle="Open tags for AI assistant"
            icon={MessageSquareDot}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading members...
          </div>
        ) : !members || members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members yet"
            description="Add team members to assign tasks and purchase requests."
            action={
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1.5 size-4" />
                Add Member
              </Button>
            }
          />
        ) : (
          <>
            <DataTable
              data={members}
              columns={columns}
              searchKey="name"
              searchPlaceholder="Search members..."
              onRowClick={(member) => setEditingMember(member)}
            />

            <div className="rounded-xl border bg-card">
              <div className="border-b px-5 py-3">
                <h2 className="text-sm font-semibold">
                  AI Assignment Inbox
                </h2>
              </div>
              {!aiMember ? (
                <p className="px-5 py-6 text-sm text-muted-foreground">
                  AI assistant member not configured yet. Run latest migrations
                  to enable AI tagging.
                </p>
              ) : !aiMentions || aiMentions.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted-foreground">
                  No active AI mentions.
                </p>
              ) : (
                <div className="divide-y">
                  {aiMentions.map((mention) => (
                    <button
                      key={mention.id}
                      className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-muted/50 transition-colors"
                      type="button"
                      onClick={() => mention.task?.id && router.push(`/tasks/${mention.task.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {mention.task?.title || "Unknown task"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mention.context || "No context provided"}
                        </p>
                      </div>
                      <StatusBadge status={mention.status} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription className="sr-only">
              Fill in details to add a new team member.
            </DialogDescription>
          </DialogHeader>
          <MemberForm
            onSuccess={() => {
              setShowCreate(false);
              mutate();
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription className="sr-only">
              Update member profile details.
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <MemberForm
              member={editingMember}
              onSuccess={() => {
                setEditingMember(null);
                mutate();
              }}
              onCancel={() => setEditingMember(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingMember}
        onOpenChange={(open) => !open && setDeletingMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingMember?.name}&quot;.
              Any assigned tasks or purchase requests will become unassigned.
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
