"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export const SignOutForm = () => {
  const router = useRouter();

  return (
    <form
      action={async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="w-full"
    >
      <button
        className="w-full px-1 py-0.5 text-left text-red-500"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
};
