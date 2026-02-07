import { tool } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";

export const getLabDashboard = tool({
  description: `Get a comprehensive overview of the lab's current state including device counts by status, parts inventory summary, active initiatives, and total inventory value. Use this when the user asks for a lab overview, dashboard summary, or general status report.`,
  inputSchema: z.object({}),
  execute: async () => {
    try {
      // Run all queries in parallel
      const [
        devicesResult,
        partsResult,
        initiativesResult,
        partValuesResult,
      ] = await Promise.all([
        supabase.from("devices").select("status"),
        supabase.from("parts").select("status, quantity"),
        supabase.from("initiatives").select("status"),
        supabase.from("parts").select("quantity, unit_cost"),
      ]);

      if (devicesResult.error) return { error: devicesResult.error.message };
      if (partsResult.error) return { error: partsResult.error.message };
      if (initiativesResult.error) return { error: initiativesResult.error.message };
      if (partValuesResult.error) return { error: partValuesResult.error.message };

      // Compute device stats
      const devices = devicesResult.data;
      const devicesByStatus = {
        available: devices.filter((d) => d.status === "available").length,
        in_use: devices.filter((d) => d.status === "in_use").length,
        maintenance: devices.filter((d) => d.status === "maintenance").length,
        retired: devices.filter((d) => d.status === "retired").length,
        total: devices.length,
      };

      // Compute part stats
      const parts = partsResult.data;
      const spareCount = parts
        .filter((p) => p.status === "spare")
        .reduce((sum, p) => sum + (p.quantity || 0), 0);
      const attachedCount = parts
        .filter((p) => p.status === "attached")
        .reduce((sum, p) => sum + (p.quantity || 0), 0);

      // Compute inventory value
      const totalValue = partValuesResult.data.reduce(
        (sum, p) => sum + (p.quantity || 0) * (p.unit_cost || 0),
        0
      );

      // Compute initiative stats
      const initiatives = initiativesResult.data;
      const initiativesByStatus = {
        planning: initiatives.filter((i) => i.status === "planning").length,
        active: initiatives.filter((i) => i.status === "active").length,
        completed: initiatives.filter((i) => i.status === "completed").length,
        archived: initiatives.filter((i) => i.status === "archived").length,
        total: initiatives.length,
      };

      return {
        devices: devicesByStatus,
        parts: {
          spare: spareCount,
          attached: attachedCount,
          totalItems: parts.length,
        },
        initiatives: initiativesByStatus,
        inventoryValue: totalValue,
        inventoryValueFormatted: `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      };
    } catch (err) {
      return { error: `Failed to get lab dashboard: ${String(err)}` };
    }
  },
});
