"use client";

import useSWR from "swr";
import { partsApi } from "@/lib/supabase/api";

export function useParts() {
  return useSWR("lab:parts", () => partsApi.getAll(), {
    revalidateOnFocus: false,
  });
}

export function useSpareParts() {
  return useSWR("lab:parts:spare", () => partsApi.getSpare(), {
    revalidateOnFocus: false,
  });
}

export function usePart(id: string | null) {
  return useSWR(
    id ? `lab:part:${id}` : null,
    () => partsApi.getById(id!),
    { revalidateOnFocus: false }
  );
}

export function usePartsByDevice(deviceId: string | null) {
  return useSWR(
    deviceId ? `lab:parts:device:${deviceId}` : null,
    () => partsApi.getByDevice(deviceId!),
    { revalidateOnFocus: false }
  );
}

export function usePartMutations() {
  return {
    createPart: partsApi.create,
    updatePart: partsApi.update,
    deletePart: partsApi.delete,
  };
}
