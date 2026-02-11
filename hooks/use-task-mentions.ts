"use client";

import useSWR from "swr";
import { taskMentionsApi } from "@/lib/supabase/api";
import type { TaskMentionStatus } from "@/lib/types/lab";

export function useTaskMentionsByMember(
  memberId: string | null,
  statuses: TaskMentionStatus[] = ["new"]
) {
  return useSWR(
    memberId ? `lab:task-mentions:${memberId}:${statuses.join(",")}` : null,
    () => taskMentionsApi.getByMember(memberId!, statuses),
    {
      revalidateOnFocus: false,
    }
  );
}
