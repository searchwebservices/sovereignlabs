import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";

export const manageDevice = tool({
  description: `Create, update, or delete a device in the lab inventory. Use this when the user asks to add new equipment, change a device's status, update device details, or remove a device.`,
  inputSchema: z.object({
    action: z
      .enum(["create", "update", "delete"])
      .describe("The operation to perform"),
    id: z
      .string()
      .uuid()
      .optional()
      .describe("Device ID (required for update/delete)"),
    name: z
      .string()
      .optional()
      .describe("Device name (required for create)"),
    type: z
      .enum([
        "smartphone", "tablet", "laptop", "monitor", "desktop", "server",
        "storage_drive", "smartwatch", "smart_ring", "smart_speaker", "router",
        "printer", "camera", "drone", "robot", "sensor_hub", "microcontroller",
        "vr_headset", "keyboard", "mouse", "headphones", "game_console", "other",
      ])
      .optional()
      .describe("Device type/category (e.g. smartphone, laptop, server, robot)"),
    description: z.string().optional().describe("Device description"),
    status: z
      .enum(["available", "in_use", "maintenance", "retired"])
      .optional()
      .describe("Device status"),
    location: z.string().optional().describe("Physical location in the lab"),
    serial_number: z.string().optional().describe("Serial number"),
    cost: z.number().optional().describe("Purchase cost in USD"),
    purchase_date: z
      .string()
      .optional()
      .describe("Purchase date (YYYY-MM-DD format)"),
  }),
  execute: async ({ action, id, ...fields }) => {
    try {
      if (action === "create") {
        if (!fields.name) return { error: "Name is required to create a device" };
        const { data, error } = await supabase
          .from("devices")
          .insert({
            name: fields.name,
            type: fields.type || null,
            description: fields.description || null,
            status: fields.status || "available",
            location: fields.location || null,
            serial_number: fields.serial_number || null,
            cost: fields.cost || null,
            purchase_date: fields.purchase_date || null,
          })
          .select()
          .single();
        if (error) return { error: error.message };
        return { success: true, message: `Device "${data.name}" created`, device: data };
      }

      if (action === "update") {
        if (!id) return { error: "Device ID is required for update" };
        const updates: Record<string, unknown> = {};
        if (fields.name !== undefined) updates.name = fields.name;
        if (fields.type !== undefined) updates.type = fields.type;
        if (fields.description !== undefined) updates.description = fields.description;
        if (fields.status !== undefined) updates.status = fields.status;
        if (fields.location !== undefined) updates.location = fields.location;
        if (fields.serial_number !== undefined) updates.serial_number = fields.serial_number;
        if (fields.cost !== undefined) updates.cost = fields.cost;
        if (fields.purchase_date !== undefined) updates.purchase_date = fields.purchase_date;

        const { data, error } = await supabase
          .from("devices")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) return { error: error.message };
        return { success: true, message: `Device "${data.name}" updated`, device: data };
      }

      if (action === "delete") {
        if (!id) return { error: "Device ID is required for delete" };
        const { error } = await supabase.from("devices").delete().eq("id", id);
        if (error) return { error: error.message };
        return { success: true, message: "Device deleted" };
      }

      return { error: "Invalid action" };
    } catch (err) {
      return { error: `Failed to ${action} device: ${String(err)}` };
    }
  },
});
