"use client";

import useSWR from "swr";
import { tasksApi } from "@/lib/supabase/api";

export function useTasks() {
  return useSWR("lab:tasks", () => tasksApi.getAll(), {
    revalidateOnFocus: false,
  });
}

export function useTask(id: string | null) {
  return useSWR(
    id ? `lab:task:${id}` : null,
    () => tasksApi.getById(id!),
    { revalidateOnFocus: false }
  );
}

export function useTaskCount() {
  return useSWR("lab:tasks:count", () => tasksApi.getOpenCount(), {
    revalidateOnFocus: false,
  });
}

export function useTaskMutations() {
  return {
    createTask: tasksApi.create,
    updateTask: tasksApi.update,
    deleteTask: tasksApi.delete,
  };
}
