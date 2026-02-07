import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/supabase/server";

export default function NotFound() {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      {/* @ts-expect-error -- Async Server Component */}
      <NotFoundContent />
    </Suspense>
  );
}

async function NotFoundContent() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Authenticated users hitting a bad route go home
  redirect("/");
}
