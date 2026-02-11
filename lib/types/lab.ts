// ── Status enums ──────────────────────────────────────────────
export type DeviceStatus = "available" | "in_use" | "maintenance" | "retired";
export type PartStatus = "spare" | "attached";
export type InitiativeStatus =
  | "suggested"
  | "approved"
  | "executing"
  | "finalized"
  | "archived";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskMentionStatus = "new" | "seen" | "resolved";
export type PurchaseStatus =
  | "needed"
  | "approved"
  | "ordered"
  | "shipped"
  | "received"
  | "cancelled";
export type ResearchDocumentStatus = "draft" | "final";

// ── Core entities ─────────────────────────────────────────────
export interface Device {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
  status: DeviceStatus;
  location: string | null;
  purchase_date: string | null;
  cost: number | null;
  serial_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Part {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unit_cost: number | null;
  status: PartStatus;
  device_id: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Initiative {
  id: string;
  name: string;
  description: string | null;
  status: InitiativeStatus;
  start_date: string | null;
  target_date: string | null;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
}

// ── Junction tables ───────────────────────────────────────────
export interface InitiativeDevice {
  id: string;
  initiative_id: string;
  device_id: string;
  assigned_at: string;
  notes: string | null;
  device?: Device;
}

export interface InitiativePart {
  id: string;
  initiative_id: string;
  part_id: string;
  quantity_dedicated: number;
  assigned_at: string;
  notes: string | null;
  part?: Part;
}

// ── Composed types ────────────────────────────────────────────
export interface DeviceWithParts extends Device {
  parts: Part[];
}

export interface PartWithDevice extends Part {
  device: Device | null;
}

export interface InitiativeWithRelations extends Initiative {
  initiative_devices: (InitiativeDevice & { device: Device })[];
  initiative_parts: (InitiativePart & { part: Part })[];
  research_documents?: ResearchDocumentWithRelations[];
}

// ── Team members ──────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  is_ai?: boolean;
  created_at: string;
  updated_at: string;
}

// ── Tasks ─────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithAssignee extends Task {
  assignee: TeamMember | null;
}

export interface TaskSubtask {
  id: string;
  task_id: string;
  title: string;
  is_done: boolean;
  assigned_to: string | null;
  due_date: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TaskSubtaskWithAssignee extends TaskSubtask {
  assignee: TeamMember | null;
}

export interface TaskFile {
  id: string;
  task_id: string;
  name: string;
  url: string;
  content_type: string | null;
  file_size: number | null;
  drive_file_id: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface TaskFileWithUploader extends TaskFile {
  uploaded_by_member: TeamMember | null;
}

export interface TaskMeeting {
  id: string;
  task_id: string;
  title: string;
  meeting_date: string | null;
  meeting_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskMention {
  id: string;
  task_id: string;
  member_id: string;
  context: string | null;
  status: TaskMentionStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskMentionWithMember extends TaskMention {
  member: TeamMember | null;
  task?: Task | null;
}

export interface TaskWithDetails extends TaskWithAssignee {
  subtasks: TaskSubtaskWithAssignee[];
  files: TaskFileWithUploader[];
  meetings: TaskMeeting[];
  mentions: TaskMentionWithMember[];
}

// ── Purchases ─────────────────────────────────────────────────
export interface Purchase {
  id: string;
  item_name: string;
  description: string | null;
  quantity: number;
  estimated_cost: number | null;
  vendor: string | null;
  status: PurchaseStatus;
  priority: TaskPriority;
  linked_device_id: string | null;
  linked_part_id: string | null;
  requested_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseWithRelations extends Purchase {
  requester: TeamMember | null;
  linked_device: Device | null;
  linked_part: Part | null;
}

// ── Research documents ────────────────────────────────────────
export interface ResearchDocument {
  id: string;
  initiative_id: string | null;
  title: string;
  summary: string | null;
  content: string | null;
  source_document_id: string | null;
  source_chat_id: string | null;
  storage_url: string | null;
  drive_file_id: string | null;
  status: ResearchDocumentStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchDocumentWithRelations extends ResearchDocument {
  initiative: Initiative | null;
  author: TeamMember | null;
}

// ── Internal drive files ─────────────────────────────────────
export interface InternalDriveFile {
  id: string;
  name: string;
  content_type: string;
  size_bytes: number;
  scope: string;
  is_public: boolean;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── Dashboard stats ───────────────────────────────────────────
export interface LabStats {
  deviceCount: number;
  sparePartCount: number;
  activeInitiativeCount: number;
  totalInventoryValue: number;
}

// ── User model preferences ───────────────────────────────────
export type UserModelAction = "add" | "remove" | "select";

export interface UserModel {
  id: string;
  user_id: string;
  model_id: string;
  model_name: string;
  provider: string;
  action: UserModelAction;
  created_at: string;
}
