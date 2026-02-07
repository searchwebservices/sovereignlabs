"use client";

import useSWR from "swr";
import { initiativesApi } from "@/lib/supabase/api";

export function useInitiatives() {
  return useSWR("lab:initiatives", () => initiativesApi.getAll(), {
    revalidateOnFocus: false,
  });
}

export function useActiveInitiatives() {
  return useSWR("lab:initiatives:active", () => initiativesApi.getActive(), {
    revalidateOnFocus: false,
  });
}

export function useInitiative(id: string | null) {
  return useSWR(
    id ? `lab:initiative:${id}` : null,
    () => initiativesApi.getById(id!),
    { revalidateOnFocus: false }
  );
}

export function useInitiativeMutations() {
  return {
    createInitiative: initiativesApi.create,
    updateInitiative: initiativesApi.update,
    deleteInitiative: initiativesApi.delete,
    assignDevice: initiativesApi.assignDevice,
    unassignDevice: initiativesApi.unassignDevice,
    assignPart: initiativesApi.assignPart,
    unassignPart: initiativesApi.unassignPart,
  };
}
