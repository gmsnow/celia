import { execFile } from "node:child_process";
import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { requireApiUser } from "@/lib/transfers/api-auth";
import { db, schema } from "@/lib/db";
import { logAudit } from "@/lib/transfers/audit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function normalizeHost(input: string): string {
  return input.replace(/\\+/g, "").replace(/^\/+|\/+$/g, "").trim();
}

function runNetView(host: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    execFile(
      "net.exe",
      ["view", `\\\\${host}`],
      { timeout: 20000, windowsHide: true },
      (error, stdout, stderr) => {
        if (error) {
          const detail = (stderr || "").trim() || (stdout || "").trim() || String(error.message || "");
          reject(new Error(detail));
          return;
        }
        const shares: string[] = [];
        for (const line of stdout.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (
            trimmed.startsWith("Share name") ||
            /^-+$/.test(trimmed) ||
            trimmed.startsWith("Shared resources") ||
            trimmed.startsWith("The command") ||
            trimmed.startsWith("Server")
          ) {
            continue;
          }
          const parts = trimmed.split(/\s{2,}/);
          const name = (parts[0] || "").trim();
          const type = (parts[1] || "").trim();
          if (name && type.toLowerCase().startsWith("disk")) {
            shares.push(name);
          }
        }
        resolve([...new Set(shares)]);
      },
    );
  });
}

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { host?: string } | null;
  const host = normalizeHost(body?.host ?? "");
  if (!host) {
    return NextResponse.json({ error: "VALIDATION_FAILED" }, { status: 400 });
  }

  try {
    const discovered = await runNetView(host);
    if (discovered.length === 0) {
      return NextResponse.json(
        { error: "NO_SHARES_FOUND", host },
        { status: 404 },
      );
    }

    const existing = await db
      .select({ id: schema.nasShares.id, share: schema.nasShares.share, name: schema.nasShares.name })
      .from(schema.nasShares)
      .where(eq(schema.nasShares.host, host));

    const existingShares = new Set(existing.map((item) => item.share.toLowerCase()));
    const toCreate = discovered.filter((share) => !existingShares.has(share.toLowerCase()));

    if (toCreate.length > 0) {
      await db.insert(schema.nasShares).values(
        toCreate.map((share) => ({
          name: share,
          host,
          protocol: "SMB",
          share,
          username: null,
          passwordEnc: null,
          basePath: null,
          isActive: true,
        })),
      );
    }

    const toReactivate = existing.filter((item) =>
      discovered.some((share) => share.toLowerCase() === item.share.toLowerCase()),
    );
    if (toReactivate.length > 0) {
      await db
        .update(schema.nasShares)
        .set({ isActive: true, updatedAt: new Date() })
        .where(
          inArray(
            schema.nasShares.id,
            toReactivate.map((item) => item.id),
          ),
        );
    }

    await logAudit({
      action: "NAS_SERVER_ADDED",
      entityType: "NAS_SHARE",
      userId: user.id,
      metadata: { host, discovered },
    });
    logger.info("nas server added", { host, shares: discovered.length, userId: user.id });

    const shares = await db
      .select()
      .from(schema.nasShares)
      .where(eq(schema.nasShares.host, host))
      .orderBy(schema.nasShares.share);

    return NextResponse.json({ ok: true, host, discovered, shares }, { status: 201 });
  } catch (error) {
    logger.error("nas server discovery failed", { host, error });
    return NextResponse.json(
      { error: "DISCOVERY_FAILED", message: String(error instanceof Error ? error.message : error) },
      { status: 502 },
    );
  }
}
