import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
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
    const [updated] = await getDb()
      .update(schema.users)
      .set({
        displayName: onboard.data.displayName,
        age: onboard.data.age,
        avatar: onboard.data.avatar,
        color: onboard.data.color,
        playStyle: onboard.data.playStyle,
        skill: onboard.data.skill,
        genres: onboard.data.genres,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning();

    if (!updated) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ user: rowToClientUser(updated) });
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

  const updates: Partial<typeof schema.users.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (data.displayName !== undefined) updates.displayName = data.displayName;
  if (data.bio !== undefined) updates.bio = data.bio || null;
  if (data.avatar !== undefined) updates.avatar = data.avatar;
  if (data.color !== undefined) updates.color = data.color;
  if (data.genres !== undefined) updates.genres = data.genres;

  const [updated] = await getDb()
    .update(schema.users)
    .set(updates)
    .where(eq(schema.users.id, userId))
    .returning();

  if (!updated) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ user: rowToClientUser(updated) });
}
