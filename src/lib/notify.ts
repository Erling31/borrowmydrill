import { db } from "@/lib/db";

export async function notify(userId: string, type: string, title: string, body: string, link?: string) {
  try {
    await db.notification.create({ data: { userId, type, title, body, link: link ?? null } });
  } catch (e) {
    console.error("notify: failed to create notification", e);
  }
}
