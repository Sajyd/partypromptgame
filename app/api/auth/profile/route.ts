import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { onboardingProfileSchema, patchProfileSchema } from "@/lib/auth/validation";
import { rowToClientUser } from "@/lib/auth/map-user";

export async function PATCH(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const onboard = onboardingProfileSchema.safeParse(body);
  if (onboard.success) {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          displayName: onboard.data.displayName,
          age: onboard.data.age,
          avatar: onboard.data.avatar,
          color: onboard.data.color,
          playStyle: onboard.data.playStyle,
          skill: onboard.data.skill,
          genres: onboard.data.genres,
          onboardingCompleted: true,
        },
      });
      return Response.json({ user: rowToClientUser(updated) });
    } catch {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
  }

  const patch = patchProfileSchema.safeParse(body);
  if (!patch.success) {
    return Response.json(
      { error: "Invalid input", details: patch.error.flatten() },
      { status: 400 },
    );
  }

  const data = patch.data;
  if (
    data.displayName === undefined &&
    data.bio === undefined &&
    data.avatar === undefined &&
    data.color === undefined &&
    data.genres === undefined
  ) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updates: Prisma.UserUpdateInput = {};
  if (data.displayName !== undefined) updates.displayName = data.displayName;
  if (data.bio !== undefined) updates.bio = data.bio || null;
  if (data.avatar !== undefined) updates.avatar = data.avatar;
  if (data.color !== undefined) updates.color = data.color;
  if (data.genres !== undefined) updates.genres = data.genres;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });
    return Response.json({ user: rowToClientUser(updated) });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
