"use client";

import useSWR from "swr";
import { teamMembersApi } from "@/lib/supabase/api";

export function useTeamMembers() {
  return useSWR("lab:team-members", () => teamMembersApi.getAll(), {
    revalidateOnFocus: false,
  });
}

export function useTeamMemberMutations() {
  return {
    createTeamMember: teamMembersApi.create,
    updateTeamMember: teamMembersApi.update,
    deleteTeamMember: teamMembersApi.delete,
  };
}
