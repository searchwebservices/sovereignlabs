"use client";

import useSWR from "swr";
import { purchasesApi } from "@/lib/supabase/api";

export function usePurchases() {
  return useSWR("lab:purchases", () => purchasesApi.getAll(), {
    revalidateOnFocus: false,
  });
}

export function usePurchase(id: string | null) {
  return useSWR(
    id ? `lab:purchase:${id}` : null,
    () => purchasesApi.getById(id!),
    { revalidateOnFocus: false }
  );
}

export function usePurchaseCount() {
  return useSWR("lab:purchases:count", () => purchasesApi.getPendingCount(), {
    revalidateOnFocus: false,
  });
}

export function usePurchaseMutations() {
  return {
    createPurchase: purchasesApi.create,
    updatePurchase: purchasesApi.update,
    deletePurchase: purchasesApi.delete,
  };
}
