import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { accounts, users } from "../drizzle/schema";

async function main() {
  const username = "admin";
  const existing = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (existing) {
    console.log("[seed] admin user already exists, skipping");
    return;
  }

  const now = new Date();
  const userId = crypto.randomUUID();

  await db.insert(users).values({
    id: userId,
    name: "المدير",
    email: "admin@celia.local",
    emailVerified: true,
    role: "admin",
    username,
    displayUsername: username,
    createdAt: now,
    updatedAt: now,
  });

  const passwordHash = await hashPassword("admin");
  await db.insert(accounts).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  console.log("[seed] admin user created (username=admin, password=admin)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[seed] failed:", error);
    process.exit(1);
  });
