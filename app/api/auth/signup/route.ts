import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { signupSchema } from "@/lib/auth/validation";
import { rowToClientUser } from "@/lib/auth/map-user";
import { AVATARS, COLORS } from "@/lib/mock-data";
import { randomCodeSecure } from "@/lib/server/random-code";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, password, displayName } = parsed.data;

  const passwordHash = await hashPassword(password);
  const friendCode = randomCodeSecure(8);

  try {
    const inserted = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        displayName,
        age: 18,
        avatar: AVATARS[0]!,
        color: COLORS[0]!,
        playStyle: "creative",
        skill: "casual",
        genres: [],
        friendCode,
        stats: {
          gamesCreated: 0,
          gamesPlayed: 0,
          contributions: 0,
          likes: 0,
        },
        onboardingCompleted: false,
      },
    });

    const token = await createSessionToken(inserted.id);
    await setSessionCookie(token);

    return Response.json({ user: rowToClientUser(inserted) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }
    console.error(e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
