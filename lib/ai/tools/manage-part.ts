import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";

export const managePart = tool({
  description: `Create, update, or delete a part in the lab inventory. Use this when the user asks to add new components, update part quantities, attach/detach parts from devices, or remove parts.`,
  inputSchema: z.object({
    action: z
      .enum(["create", "update", "delete"])
      .describe("The operation to perform"),
    id: z
      .string()
      .uuid()
      .optional()
      .describe("Part ID (required for update/delete)"),
    name: z.string().optional().describe("Part name (required for create)"),
    description: z.string().optional().describe("Part description"),
    category: z
      .enum([
        "sensor", "actuator", "cable", "battery", "circuit_board", "processor",
        "memory", "display", "camera_module", "antenna", "cooling", "frame",
        "fastener", "led", "speaker", "microphone", "switch", "power_supply",
        "connector", "optics", "enclosure", "resistor", "gear", "other",
      ])
      .optional()
      .describe("Part category (e.g. sensor, battery, processor, cable)"),
    quantity: z.number().optional().describe("Quantity in stock"),
    unit_cost: z.number().optional().describe("Cost per unit in USD"),
    status: z
      .enum(["spare", "attached"])
      .optional()
      .describe("Part status"),
    device_id: z
      .string()
      .uuid()
      .nullable()
      .optional()
      .describe("Device ID to attach to (null to detach)"),
    location: z.string().optional().describe("Storage location"),
  }),
  execute: async ({ action, id, ...fields }) => {
    try {
      if (action === "create") {
        if (!fields.name) return { error: "Name is required to create a part" };
        const { data, error } = await supabase
          .from("parts")
          .insert({
            name: fields.name,
            description: fields.description || null,
            category: fields.category || null,
            quantity: fields.quantity ?? 1,
            unit_cost: fields.unit_cost || null,
            status: fields.status || "spare",
            device_id: fields.device_id || null,
            location: fields.location || null,
          })
          .select()
          .single();
        if (error) return { error: error.message };
        return { success: true, message: `Part "${data.name}" created`, part: data };
      }

      if (action === "update") {
        if (!id) return { error: "Part ID is required for update" };
        const updates: Record<string, unknown> = {};
        if (fields.name !== undefined) updates.name = fields.name;
        if (fields.description !== undefined) updates.description = fields.description;
        if (fields.category !== undefined) updates.category = fields.category;
        if (fields.quantity !== undefined) updates.quantity = fields.quantity;
        if (fields.unit_cost !== undefined) updates.unit_cost = fields.unit_cost;
        if (fields.status !== undefined) updates.status = fields.status;
        if (fields.device_id !== undefined) updates.device_id = fields.device_id;
        if (fields.location !== undefined) updates.location = fields.location;

        const { data, error } = await supabase
          .from("parts")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) return { error: error.message };
        return { success: true, message: `Part "${data.name}" updated`, part: data };
      }

      if (action === "delete") {
        if (!id) return { error: "Part ID is required for delete" };
        const { error } = await supabase.from("parts").delete().eq("id", id);
        if (error) return { error: error.message };
        return { success: true, message: "Part deleted" };
      }

      return { error: "Invalid action" };
    } catch (err) {
      return { error: `Failed to ${action} part: ${String(err)}` };
    }
  },
});
