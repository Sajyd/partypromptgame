import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { rowToClientUser } from "@/lib/auth/map-user";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ user: null });
  }

  const [user] = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) {
    return Response.json({ user: null });
  }

  return Response.json({ user: rowToClientUser(user) });
}
