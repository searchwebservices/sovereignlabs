"use client";

import useSWR from "swr";
import { getLabStats } from "@/lib/supabase/api";

export function useLabStats() {
  return useSWR("lab:stats", () => getLabStats(), {
    revalidateOnFocus: false,
    refreshInterval: 30_000, // refresh every 30s
  });
}
