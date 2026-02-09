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
  TaskWithAssignee,
  Purchase,
  PurchaseWithRelations,
  UserModel,
} from "@/lib/types/lab";

function getSupabase() {
  return createAdminClient();
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
      .in("status", ["planning", "active"])
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Initiative[];
  },

  getById: async (id: string): Promise<InitiativeWithRelations> => {
    const supabase = getSupabase();
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
    return data as InitiativeWithRelations;
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
      .in("status", ["planning", "active"]);
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

  getById: async (id: string): Promise<TaskWithAssignee> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .select("*, assignee:team_members(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as TaskWithAssignee;
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
