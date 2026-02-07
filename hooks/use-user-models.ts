"use client";

import useSWR from "swr";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import {
  type ChatModel,
  defaultChatModels,
  DEFAULT_CHAT_MODEL,
  getProviderFromId,
  groupModelsByProvider,
} from "@/lib/ai/models";
import { userModelsApi } from "@/lib/supabase/api";
import { fetcher } from "@/lib/utils";

/** Lightweight hook to get the current user's id from the session API */
function useCurrentUser() {
  const { data, isLoading } = useSWR<{ id: string; email: string }>(
    "/api/session",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
  return { userId: data?.id ?? null, isLoading };
}

/**
 * Database-backed replacement for the old localStorage useCustomModels hook.
 * Returns: allModels, addModel, removeModel, selectModel, selectedModelId, modelsByProvider, isLoading
 */
export function useUserModels() {
  const { userId, isLoading: userLoading } = useCurrentUser();
  const { mutate: globalMutate } = useSWRConfig();

  const swrKey = userId ? `user-models-${userId}` : null;

  const { data: rows, isLoading: modelsLoading, mutate } = useSWR(
    swrKey,
    () => userModelsApi.getByUserId(userId!),
    { revalidateOnFocus: false }
  );

  const isLoading = userLoading || modelsLoading;

  // Derive state from DB rows
  const customModels: ChatModel[] = (rows ?? [])
    .filter((r) => r.action === "add")
    .map((r) => ({
      id: r.model_id,
      name: r.model_name,
      provider: r.provider,
      description: "Custom model via OpenRouter",
    }));

  const removedIds: string[] = (rows ?? [])
    .filter((r) => r.action === "remove")
    .map((r) => r.model_id);

  const selectRow = (rows ?? [])
    .filter((r) => r.action === "select")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const selectedModelId = selectRow?.model_id ?? DEFAULT_CHAT_MODEL;

  const allModels: ChatModel[] = [
    ...defaultChatModels.filter((m) => !removedIds.includes(m.id)),
    ...customModels,
  ];

  const addModel = async (id: string, name?: string): Promise<boolean> => {
    if (!userId) return false;
    if (allModels.some((m) => m.id === id)) {
      toast.error("Model already exists");
      return false;
    }
    const provider = getProviderFromId(id);
    const modelName = name || id.split("/").pop() || id;
    try {
      await userModelsApi.addCustomModel(userId, {
        model_id: id,
        model_name: modelName,
        provider,
      });
      await mutate();
      toast.success(`Added ${modelName}`);
      return true;
    } catch {
      toast.error("Failed to add model");
      return false;
    }
  };

  const removeModel = async (id: string): Promise<void> => {
    if (!userId) return;
    const isDefault = defaultChatModels.some((m) => m.id === id);
    try {
      if (isDefault) {
        const model = defaultChatModels.find((m) => m.id === id)!;
        await userModelsApi.removeDefaultModel(userId, {
          model_id: id,
          model_name: model.name,
          provider: model.provider,
        });
      } else {
        await userModelsApi.deleteCustomModel(userId, id);
      }
      await mutate();
      toast.success("Model removed");
    } catch {
      toast.error("Failed to remove model");
    }
  };

  const selectModel = async (id: string): Promise<void> => {
    if (!userId) return;
    const model = allModels.find((m) => m.id === id);
    if (!model) return;
    try {
      await userModelsApi.selectModel(userId, {
        model_id: model.id,
        model_name: model.name,
        provider: model.provider,
      });
      await mutate();
    } catch {
      toast.error("Failed to save model selection");
    }
  };

  return {
    allModels,
    addModel,
    removeModel,
    selectModel,
    selectedModelId,
    modelsByProvider: groupModelsByProvider(allModels),
    isLoading,
  };
}
