"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { minecraftProfiles } from "@/db/schema";
import { auth } from "@/lib/auth";

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "admin") throw new Error("Unauthorized");
}

export async function saveProfile(input: {
  mention: string;
  username: string;
  uuid: string;
  bio: string;
}) {
  await checkAdmin();
  const mention = input.mention.trim().replace(/^@/, "").toLowerCase();
  const username = input.username.trim();
  const rawUuid = input.uuid.trim();
  const uuid = rawUuid.replace(/-/g, "").toLowerCase();
  const bio = input.bio.trim();
  if (!/^[a-z0-9_]{1,32}$/.test(mention))
    throw new Error(
      "Mention must contain 1–32 letters, numbers, or underscores.",
    );
  if (!/^[a-zA-Z0-9_]{3,16}$/.test(username))
    throw new Error(
      "Minecraft name must contain 3–16 letters, numbers, or underscores.",
    );
  if (
    rawUuid &&
    !/^(?:[a-fA-F0-9]{32}|[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12})$/.test(
      rawUuid,
    )
  )
    throw new Error("Enter a valid Minecraft UUID or leave it empty.");
  if (bio.length > 280) throw new Error("Bio must be 280 characters or fewer.");
  const values = { mention, username, uuid: uuid || null, bio };
  await db
    .insert(minecraftProfiles)
    .values(values)
    .onConflictDoUpdate({ target: minecraftProfiles.mention, set: values });
  revalidatePath("/");
}

export async function deleteProfile(id: number) {
  await checkAdmin();
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid account.");
  await db.delete(minecraftProfiles).where(eq(minecraftProfiles.id, id));
  revalidatePath("/");
}
