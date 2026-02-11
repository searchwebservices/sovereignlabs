"use client";

import useSWR from "swr";
import { researchDocumentsApi } from "@/lib/supabase/api";

export function useResearchDocuments() {
  return useSWR("lab:research-documents", () => researchDocumentsApi.getAll(), {
    revalidateOnFocus: false,
  });
}

export function useFinalResearchDocuments() {
  return useSWR(
    "lab:research-documents:final",
    () => researchDocumentsApi.getFinal(),
    {
      revalidateOnFocus: false,
    }
  );
}
