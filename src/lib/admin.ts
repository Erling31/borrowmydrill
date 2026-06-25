import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Returns the current user's id if they are an admin, otherwise null.
 * Verifies against the database (source of truth) rather than trusting the
 * session token alone — used to authorize all mutating admin endpoints.
 */
export async function requireAdmin(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  return user?.isAdmin ? session.user.id : null;
}
