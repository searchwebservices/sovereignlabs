// ── Status enums ──────────────────────────────────────────────
export type DeviceStatus = "available" | "in_use" | "maintenance" | "retired";
export type PartStatus = "spare" | "attached";
export type InitiativeStatus =
  | "planning"
  | "active"
  | "completed"
  | "archived";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type PurchaseStatus =
  | "needed"
  | "approved"
  | "ordered"
  | "shipped"
  | "received"
  | "cancelled";

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
}

// ── Team members ──────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
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
