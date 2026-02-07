import { getSession } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return Response.json(null, { status: 401 });
  }

  return Response.json(session.user);
}
