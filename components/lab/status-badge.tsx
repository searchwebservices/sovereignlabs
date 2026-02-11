"use client";

import type {
  DeviceStatus,
  PartStatus,
  InitiativeStatus,
  TaskStatus,
  TaskMentionStatus,
  PurchaseStatus,
  ResearchDocumentStatus,
} from "@/lib/types/lab";

type Status =
  | DeviceStatus
  | PartStatus
  | InitiativeStatus
  | TaskStatus
  | TaskMentionStatus
  | PurchaseStatus
  | ResearchDocumentStatus;

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  // Device statuses
  available: {
    label: "Available",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  in_use: {
    label: "In Use",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  retired: {
    label: "Retired",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
  },
  // Part statuses
  spare: {
    label: "Spare",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  attached: {
    label: "Attached",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  // Initiative statuses
  suggested: {
    label: "Suggested",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  approved: {
    label: "Approved",
    className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  executing: {
    label: "Executing",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  finalized: {
    label: "Finalized",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  archived: {
    label: "Archived",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
  },
  // Task statuses
  todo: {
    label: "To Do",
    className: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  done: {
    label: "Done",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  // Task mention statuses
  new: {
    label: "New",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  seen: {
    label: "Seen",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  // Purchase statuses
  needed: {
    label: "Needed",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  },
  ordered: {
    label: "Ordered",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  shipped: {
    label: "Shipped",
    className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
  received: {
    label: "Received",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
  },
  // Research document statuses
  draft: {
    label: "Draft",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  final: {
    label: "Final",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
