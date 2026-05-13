import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { rowToClientUser } from "@/lib/auth/map-user";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return Response.json({ user: null });
  }

  return Response.json({ user: rowToClientUser(user) });
}
