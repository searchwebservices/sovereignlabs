import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";

export const manageInitiative = tool({
  description: `Create, update, or delete a research initiative. Also supports assigning/unassigning devices and parts to initiatives. Use this when the user asks to create research projects, update their status, or manage resource allocations.`,
  inputSchema: z.object({
    action: z
      .enum([
        "create",
        "update",
        "delete",
        "assign_device",
        "unassign_device",
        "assign_part",
        "unassign_part",
      ])
      .describe("The operation to perform"),
    id: z
      .string()
      .uuid()
      .optional()
      .describe("Initiative ID (required for update/delete/assign operations)"),
    name: z
      .string()
      .optional()
      .describe("Initiative name (required for create)"),
    description: z.string().optional().describe("Initiative description"),
    status: z
      .enum(["planning", "active", "completed", "archived"])
      .optional()
      .describe("Initiative status"),
    start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    target_date: z.string().optional().describe("Target completion date (YYYY-MM-DD)"),
    completion_date: z.string().optional().describe("Actual completion date (YYYY-MM-DD)"),
    device_id: z
      .string()
      .uuid()
      .optional()
      .describe("Device ID (for assign/unassign device)"),
    part_id: z
      .string()
      .uuid()
      .optional()
      .describe("Part ID (for assign/unassign part)"),
    assignment_id: z
      .string()
      .uuid()
      .optional()
      .describe("Assignment record ID (for unassign operations)"),
    quantity: z
      .number()
      .optional()
      .describe("Quantity to dedicate (for assign_part)"),
    notes: z.string().optional().describe("Notes for assignment"),
  }),
  execute: async ({ action, id, ...fields }) => {
    try {
      if (action === "create") {
        if (!fields.name)
          return { error: "Name is required to create an initiative" };
        const { data, error } = await supabase
          .from("initiatives")
          .insert({
            name: fields.name,
            description: fields.description || null,
            status: fields.status || "planning",
            start_date: fields.start_date || null,
            target_date: fields.target_date || null,
            completion_date: fields.completion_date || null,
          })
          .select()
          .single();
        if (error) return { error: error.message };
        return {
          success: true,
          message: `Initiative "${data.name}" created`,
          initiative: data,
        };
      }

      if (action === "update") {
        if (!id) return { error: "Initiative ID is required for update" };
        const updates: Record<string, unknown> = {};
        if (fields.name !== undefined) updates.name = fields.name;
        if (fields.description !== undefined) updates.description = fields.description;
        if (fields.status !== undefined) updates.status = fields.status;
        if (fields.start_date !== undefined) updates.start_date = fields.start_date;
        if (fields.target_date !== undefined) updates.target_date = fields.target_date;
        if (fields.completion_date !== undefined)
          updates.completion_date = fields.completion_date;

        const { data, error } = await supabase
          .from("initiatives")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) return { error: error.message };
        return {
          success: true,
          message: `Initiative "${data.name}" updated`,
          initiative: data,
        };
      }

      if (action === "delete") {
        if (!id) return { error: "Initiative ID is required for delete" };
        const { error } = await supabase
          .from("initiatives")
          .delete()
          .eq("id", id);
        if (error) return { error: error.message };
        return { success: true, message: "Initiative deleted" };
      }

      if (action === "assign_device") {
        if (!id || !fields.device_id)
          return { error: "Initiative ID and device_id are required" };
        const { data, error } = await supabase
          .from("initiative_devices")
          .insert({
            initiative_id: id,
            device_id: fields.device_id,
            notes: fields.notes || null,
          })
          .select()
          .single();
        if (error) return { error: error.message };
        return { success: true, message: "Device assigned to initiative", assignment: data };
      }

      if (action === "unassign_device") {
        const removeId = fields.assignment_id;
        if (!removeId) return { error: "assignment_id is required to unassign" };
        const { error } = await supabase
          .from("initiative_devices")
          .delete()
          .eq("id", removeId);
        if (error) return { error: error.message };
        return { success: true, message: "Device unassigned from initiative" };
      }

      if (action === "assign_part") {
        if (!id || !fields.part_id)
          return { error: "Initiative ID and part_id are required" };
        const { data, error } = await supabase
          .from("initiative_parts")
          .insert({
            initiative_id: id,
            part_id: fields.part_id,
            quantity_dedicated: fields.quantity ?? 1,
            notes: fields.notes || null,
          })
          .select()
          .single();
        if (error) return { error: error.message };
        return { success: true, message: "Part assigned to initiative", assignment: data };
      }

      if (action === "unassign_part") {
        const removeId = fields.assignment_id;
        if (!removeId) return { error: "assignment_id is required to unassign" };
        const { error } = await supabase
          .from("initiative_parts")
          .delete()
          .eq("id", removeId);
        if (error) return { error: error.message };
        return { success: true, message: "Part unassigned from initiative" };
      }

      return { error: "Invalid action" };
    } catch (err) {
      return { error: `Failed to ${action} initiative: ${String(err)}` };
    }
  },
});
