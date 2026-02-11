import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";

export const queryLabData = tool({
  description: `Query the lab database for devices, parts, or initiatives. Use this to answer questions about lab inventory, equipment status, parts availability, or research initiative progress. You can filter by status, search by name, or get counts.`,
  inputSchema: z.object({
    entity: z
      .enum(["devices", "parts", "initiatives"])
      .describe("Which type of lab entity to query"),
    action: z
      .enum(["list", "count", "search"])
      .describe(
        "list = return records, count = return count only, search = filter by name"
      ),
    status: z
      .string()
      .optional()
      .describe(
        "Filter by status. Devices: available/in_use/maintenance/retired. Parts: spare/attached. Initiatives: suggested/approved/executing/finalized/archived"
      ),
    searchTerm: z
      .string()
      .optional()
      .describe("Search term for name/description (used with action=search)"),
    limit: z
      .number()
      .optional()
      .default(20)
      .describe("Max records to return (default 20)"),
  }),
  execute: async ({ entity, action, status, searchTerm, limit }) => {
    try {
      if (action === "count") {
        let query = supabase
          .from(entity)
          .select("*", { count: "exact", head: true });
        if (status) query = query.eq("status", status);
        if (searchTerm) query = query.ilike("name", `%${searchTerm}%`);
        const { count, error } = await query;
        if (error) return { error: error.message };
        return { entity, count, status: status || "all" };
      }

      let query = supabase.from(entity).select("*");
      if (status) query = query.eq("status", status);
      if (searchTerm) query = query.ilike("name", `%${searchTerm}%`);
      query = query.order("created_at", { ascending: false }).limit(limit);

      const { data, error } = await query;
      if (error) return { error: error.message };
      return { entity, count: data.length, results: data };
    } catch (err) {
      return { error: `Failed to query ${entity}: ${String(err)}` };
    }
  },
});
