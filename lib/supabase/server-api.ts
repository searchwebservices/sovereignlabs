import "server-only";
import { createAdminClient } from "./admin";
import type {
  Device,
  Part,
  Initiative,
  DeviceWithParts,
  PartWithDevice,
  InitiativeWithRelations,
  LabStats,
  TeamMember,
  Task,
  TaskFile,
  TaskMeeting,
  TaskMention,
  TaskMentionStatus,
  TaskMentionWithMember,
  TaskSubtask,
  TaskWithAssignee,
  TaskWithDetails,
  Purchase,
  PurchaseWithRelations,
  ResearchDocument,
  ResearchDocumentWithRelations,
  InternalDriveFile,
  UserModel,
} from "@/lib/types/lab";

function getSupabase() {
  return createAdminClient();
}

function bufferToByteaHex(buffer: Buffer): string {
  return `\\x${buffer.toString("hex")}`;
}

function byteaToBuffer(value: unknown): Buffer {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (typeof value === "string") {
    if (value.startsWith("\\x")) {
      return Buffer.from(value.slice(2), "hex");
    }
    return Buffer.from(value, "base64");
  }

  throw new Error("Unsupported internal drive file payload");
}

// ── Devices API ───────────────────────────────────────────────
export const serverDevicesApi = {
  getAll: async (): Promise<Device[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Device[];
  },

  getById: async (id: string): Promise<DeviceWithParts> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("devices")
      .select("*, parts(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as DeviceWithParts;
  },

  create: async (
    device: Omit<Device, "id" | "created_at" | "updated_at">
  ): Promise<Device> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("devices")
      .insert(device)
      .select()
      .single();
    if (error) throw error;
    return data as Device;
  },

  update: async (id: string, updates: Partial<Device>): Promise<Device> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("devices")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Device;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase.from("devices").delete().eq("id", id);
    if (error) throw error;
  },

  getCount: async (): Promise<number> => {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from("devices")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count || 0;
  },
};

// ── Parts API ─────────────────────────────────────────────────
export const serverPartsApi = {
  getAll: async (): Promise<PartWithDevice[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("parts")
      .select("*, device:devices(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as PartWithDevice[];
  },

  getSpare: async (): Promise<Part[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("parts")
      .select("*")
      .eq("status", "spare")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Part[];
  },

  getByDevice: async (deviceId: string): Promise<Part[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("parts")
      .select("*")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Part[];
  },

  getById: async (id: string): Promise<PartWithDevice> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("parts")
      .select("*, device:devices(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as PartWithDevice;
  },

  create: async (
    part: Omit<Part, "id" | "created_at" | "updated_at">
  ): Promise<Part> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("parts")
      .insert(part)
      .select()
      .single();
    if (error) throw error;
    return data as Part;
  },

  update: async (id: string, updates: Partial<Part>): Promise<Part> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("parts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Part;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase.from("parts").delete().eq("id", id);
    if (error) throw error;
  },

  getSpareCount: async (): Promise<number> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("parts")
      .select("quantity")
      .eq("status", "spare");
    if (error) throw error;
    return (
      data?.reduce((sum, part) => sum + (part.quantity || 0), 0) || 0
    );
  },

  getTotalValue: async (): Promise<number> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("parts")
      .select("quantity, unit_cost");
    if (error) throw error;
    return (
      data?.reduce(
        (sum, part) => sum + (part.quantity || 0) * (part.unit_cost || 0),
        0
      ) || 0
    );
  },
};

// ── Initiatives API ───────────────────────────────────────────
export const serverInitiativesApi = {
  getAll: async (): Promise<Initiative[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("initiatives")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Initiative[];
  },

  getActive: async (): Promise<Initiative[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("initiatives")
      .select("*")
      .in("status", ["suggested", "approved", "executing"])
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Initiative[];
  },

  getById: async (id: string): Promise<InitiativeWithRelations> => {
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from("initiatives")
        .select(
          `
          *,
          initiative_devices(
            *,
            device:devices(*)
          ),
          initiative_parts(
            *,
            part:parts(*)
          ),
          research_documents(
            *,
            author:team_members(*)
          )
        `
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as InitiativeWithRelations;
    } catch {
      const { data, error } = await supabase
        .from("initiatives")
        .select(
          `
          *,
          initiative_devices(
            *,
            device:devices(*)
          ),
          initiative_parts(
            *,
            part:parts(*)
          )
        `
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return {
        ...(data as InitiativeWithRelations),
        research_documents: [],
      };
    }
  },

  create: async (
    initiative: Omit<Initiative, "id" | "created_at" | "updated_at">
  ): Promise<Initiative> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("initiatives")
      .insert(initiative)
      .select()
      .single();
    if (error) throw error;
    return data as Initiative;
  },

  update: async (
    id: string,
    updates: Partial<Initiative>
  ): Promise<Initiative> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("initiatives")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Initiative;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("initiatives")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  getActiveCount: async (): Promise<number> => {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from("initiatives")
      .select("*", { count: "exact", head: true })
      .in("status", ["suggested", "approved", "executing"]);
    if (error) throw error;
    return count || 0;
  },

  assignDevice: async (
    initiativeId: string,
    deviceId: string,
    notes?: string
  ) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("initiative_devices")
      .insert({
        initiative_id: initiativeId,
        device_id: deviceId,
        notes,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  unassignDevice: async (id: string) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("initiative_devices")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  assignPart: async (
    initiativeId: string,
    partId: string,
    quantity: number,
    notes?: string
  ) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("initiative_parts")
      .insert({
        initiative_id: initiativeId,
        part_id: partId,
        quantity_dedicated: quantity,
        notes,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  unassignPart: async (id: string) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("initiative_parts")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ── Team Members API ──────────────────────────────────────────
export const serverTeamMembersApi = {
  getAll: async (): Promise<TeamMember[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data as TeamMember[];
  },

  create: async (
    member: Omit<TeamMember, "id" | "created_at" | "updated_at">
  ): Promise<TeamMember> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("team_members")
      .insert(member)
      .select()
      .single();
    if (error) throw error;
    return data as TeamMember;
  },

  update: async (
    id: string,
    updates: Partial<TeamMember>
  ): Promise<TeamMember> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("team_members")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as TeamMember;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ── Tasks API ─────────────────────────────────────────────────
export const serverTasksApi = {
  getAll: async (): Promise<TaskWithAssignee[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .select("*, assignee:team_members(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as TaskWithAssignee[];
  },

  getById: async (id: string): Promise<TaskWithDetails> => {
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          assignee:team_members(*),
          subtasks:task_subtasks(
            *,
            assignee:team_members(*)
          ),
          files:task_files(
            *,
            uploaded_by_member:team_members(*)
          ),
          meetings:task_meetings(*),
          mentions:task_mentions(
            *,
            member:team_members(*)
          )
          `
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as TaskWithDetails;
    } catch {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, assignee:team_members(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return {
        ...(data as TaskWithAssignee),
        subtasks: [],
        files: [],
        meetings: [],
        mentions: [],
      } as TaskWithDetails;
    }
  },

  create: async (
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },

  getOpenCount: async (): Promise<number> => {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .in("status", ["todo", "in_progress"]);
    if (error) throw error;
    return count || 0;
  },
};

// ── Task Subtasks API ────────────────────────────────────────
export const serverTaskSubtasksApi = {
  create: async (
    subtask: Omit<TaskSubtask, "id" | "created_at" | "updated_at">
  ): Promise<TaskSubtask> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("task_subtasks")
      .insert(subtask)
      .select()
      .single();
    if (error) throw error;
    return data as TaskSubtask;
  },

  update: async (
    id: string,
    updates: Partial<TaskSubtask>
  ): Promise<TaskSubtask> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("task_subtasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as TaskSubtask;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("task_subtasks")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ── Task Files API ────────────────────────────────────────────
export const serverTaskFilesApi = {
  getByTask: async (taskId: string): Promise<TaskFile[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("task_files")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as TaskFile[];
  },

  create: async (
    file: Omit<TaskFile, "id" | "created_at">
  ): Promise<TaskFile> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("task_files")
      .insert(file)
      .select()
      .single();
    if (error) throw error;
    return data as TaskFile;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase.from("task_files").delete().eq("id", id);
    if (error) throw error;
  },
};

// ── Task Meetings API ─────────────────────────────────────────
export const serverTaskMeetingsApi = {
  create: async (
    meeting: Omit<TaskMeeting, "id" | "created_at" | "updated_at">
  ): Promise<TaskMeeting> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("task_meetings")
      .insert(meeting)
      .select()
      .single();
    if (error) throw error;
    return data as TaskMeeting;
  },

  update: async (
    id: string,
    updates: Partial<TaskMeeting>
  ): Promise<TaskMeeting> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("task_meetings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as TaskMeeting;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("task_meetings")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ── Task Mentions API ─────────────────────────────────────────
export const serverTaskMentionsApi = {
  create: async (
    mention: Omit<TaskMention, "id" | "created_at" | "updated_at">
  ): Promise<TaskMention> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("task_mentions")
      .insert(mention)
      .select()
      .single();
    if (error) throw error;
    return data as TaskMention;
  },

  update: async (
    id: string,
    updates: Partial<TaskMention>
  ): Promise<TaskMention> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("task_mentions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as TaskMention;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("task_mentions")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  getByMember: async (
    memberId: string,
    statuses: TaskMentionStatus[] = ["new"]
  ): Promise<TaskMentionWithMember[]> => {
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from("task_mentions")
        .select("*, member:team_members(*), task:tasks(*)")
        .eq("member_id", memberId)
        .in("status", statuses)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TaskMentionWithMember[];
    } catch {
      return [];
    }
  },
};

// ── Purchases API ─────────────────────────────────────────────
export const serverPurchasesApi = {
  getAll: async (): Promise<PurchaseWithRelations[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("purchases")
      .select(
        "*, requester:team_members(*), linked_device:devices(*), linked_part:parts(*)"
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as PurchaseWithRelations[];
  },

  getById: async (id: string): Promise<PurchaseWithRelations> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("purchases")
      .select(
        "*, requester:team_members(*), linked_device:devices(*), linked_part:parts(*)"
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as PurchaseWithRelations;
  },

  create: async (
    purchase: Omit<Purchase, "id" | "created_at" | "updated_at">
  ): Promise<Purchase> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("purchases")
      .insert(purchase)
      .select()
      .single();
    if (error) throw error;
    return data as Purchase;
  },

  update: async (
    id: string,
    updates: Partial<Purchase>
  ): Promise<Purchase> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("purchases")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Purchase;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("purchases")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  getPendingCount: async (): Promise<number> => {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from("purchases")
      .select("*", { count: "exact", head: true })
      .in("status", ["needed", "approved", "ordered", "shipped"]);
    if (error) throw error;
    return count || 0;
  },

  getTotalEstimatedCost: async (): Promise<number> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("purchases")
      .select("quantity, estimated_cost")
      .in("status", ["needed", "approved", "ordered", "shipped"]);
    if (error) throw error;
    return (
      data?.reduce(
        (sum, p) => sum + (p.quantity || 1) * (p.estimated_cost || 0),
        0
      ) || 0
    );
  },
};

// ── Research Documents API ────────────────────────────────────
export const serverResearchDocumentsApi = {
  getAll: async (): Promise<ResearchDocumentWithRelations[]> => {
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from("research_documents")
        .select("*, initiative:initiatives(*), author:team_members(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ResearchDocumentWithRelations[];
    } catch {
      return [];
    }
  },

  getFinal: async (): Promise<ResearchDocumentWithRelations[]> => {
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from("research_documents")
        .select("*, initiative:initiatives(*), author:team_members(*)")
        .eq("status", "final")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ResearchDocumentWithRelations[];
    } catch {
      return [];
    }
  },

  create: async (
    document: Omit<ResearchDocument, "id" | "created_at" | "updated_at">
  ): Promise<ResearchDocument> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("research_documents")
      .insert(document)
      .select()
      .single();
    if (error) throw error;
    return data as ResearchDocument;
  },

  update: async (
    id: string,
    updates: Partial<ResearchDocument>
  ): Promise<ResearchDocument> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("research_documents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ResearchDocument;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("research_documents")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ── Internal Drive Files API ─────────────────────────────────
export const serverDriveFilesApi = {
  list: async ({
    scope,
    limit = 100,
    isPublic,
  }: {
    scope?: string;
    limit?: number;
    isPublic?: boolean;
  } = {}): Promise<InternalDriveFile[]> => {
    const supabase = getSupabase();
    let query = supabase
      .from("internal_drive_files")
      .select(
        "id, name, content_type, size_bytes, scope, is_public, created_by_user_id, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (scope) query = query.eq("scope", scope);
    if (typeof isPublic === "boolean") query = query.eq("is_public", isPublic);

    const { data, error } = await query;
    if (error) throw error;
    return data as InternalDriveFile[];
  },

  getById: async (id: string): Promise<InternalDriveFile | null> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("internal_drive_files")
      .select(
        "id, name, content_type, size_bytes, scope, is_public, created_by_user_id, created_at, updated_at"
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as InternalDriveFile | null) || null;
  },

  getByIdWithData: async (
    id: string
  ): Promise<(InternalDriveFile & { data: Buffer }) | null> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("internal_drive_files")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    return {
      ...(data as InternalDriveFile),
      data: byteaToBuffer((data as { data: unknown }).data),
    };
  },

  createFromBuffer: async ({
    name,
    contentType,
    data,
    scope = "general",
    isPublic = false,
    createdByUserId = null,
  }: {
    name: string;
    contentType: string;
    data: Buffer;
    scope?: string;
    isPublic?: boolean;
    createdByUserId?: string | null;
  }): Promise<InternalDriveFile> => {
    const supabase = getSupabase();
    const { data: inserted, error } = await supabase
      .from("internal_drive_files")
      .insert({
        name,
        content_type: contentType,
        size_bytes: data.byteLength,
        data: bufferToByteaHex(data),
        scope,
        is_public: isPublic,
        created_by_user_id: createdByUserId,
      })
      .select(
        "id, name, content_type, size_bytes, scope, is_public, created_by_user_id, created_at, updated_at"
      )
      .single();
    if (error) throw error;
    return inserted as InternalDriveFile;
  },

  createFromBase64: async ({
    name,
    contentType,
    dataBase64,
    scope = "general",
    isPublic = false,
    createdByUserId = null,
  }: {
    name: string;
    contentType: string;
    dataBase64: string;
    scope?: string;
    isPublic?: boolean;
    createdByUserId?: string | null;
  }): Promise<InternalDriveFile> => {
    const data = Buffer.from(dataBase64, "base64");
    return serverDriveFilesApi.createFromBuffer({
      name,
      contentType,
      data,
      scope,
      isPublic,
      createdByUserId,
    });
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("internal_drive_files")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ── User Models API ──────────────────────────────────────────
export const serverUserModelsApi = {
  getByUserId: async (userId: string): Promise<UserModel[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("user_models")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as UserModel[];
  },

  addCustomModel: async (
    userId: string,
    model: { model_id: string; model_name: string; provider: string }
  ): Promise<UserModel> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("user_models")
      .insert({
        user_id: userId,
        model_id: model.model_id,
        model_name: model.model_name,
        provider: model.provider,
        action: "add",
      })
      .select()
      .single();
    if (error) throw error;
    return data as UserModel;
  },

  removeDefaultModel: async (
    userId: string,
    model: { model_id: string; model_name: string; provider: string }
  ): Promise<UserModel> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("user_models")
      .insert({
        user_id: userId,
        model_id: model.model_id,
        model_name: model.model_name,
        provider: model.provider,
        action: "remove",
      })
      .select()
      .single();
    if (error) throw error;
    return data as UserModel;
  },

  deleteCustomModel: async (userId: string, modelId: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("user_models")
      .delete()
      .eq("user_id", userId)
      .eq("model_id", modelId)
      .eq("action", "add");
    if (error) throw error;
  },

  restoreDefaultModel: async (userId: string, modelId: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("user_models")
      .delete()
      .eq("user_id", userId)
      .eq("model_id", modelId)
      .eq("action", "remove");
    if (error) throw error;
  },

  selectModel: async (
    userId: string,
    model: { model_id: string; model_name: string; provider: string }
  ): Promise<void> => {
    const supabase = getSupabase();
    await supabase
      .from("user_models")
      .delete()
      .eq("user_id", userId)
      .eq("action", "select");

    const { error } = await supabase.from("user_models").insert({
      user_id: userId,
      model_id: model.model_id,
      model_name: model.model_name,
      provider: model.provider,
      action: "select",
    });
    if (error) throw error;
  },
};

// ── Dashboard Stats ───────────────────────────────────────────
export async function getServerLabStats(): Promise<LabStats> {
  const [deviceCount, sparePartCount, activeInitiativeCount, totalInventoryValue] =
    await Promise.all([
      serverDevicesApi.getCount(),
      serverPartsApi.getSpareCount(),
      serverInitiativesApi.getActiveCount(),
      serverPartsApi.getTotalValue(),
    ]);

  return {
    deviceCount,
    sparePartCount,
    activeInitiativeCount,
    totalInventoryValue,
  };
}
