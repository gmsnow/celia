import { db, schema } from "@/lib/db";
import { buildDefaultPermissions, type PermissionKey } from "@/lib/roles/permissions";
import { USER_ROLES } from "@/lib/users/users";

export interface RolePermissionRow {
  role: string;
  permissions: Record<PermissionKey, boolean>;
}

export async function getRolePermissions(): Promise<RolePermissionRow[]> {
  const defaults = buildDefaultPermissions();
  const stored = await db
    .select({ role: schema.rolePermissions.role, permissions: schema.rolePermissions.permissions })
    .from(schema.rolePermissions);

  const storedMap = new Map(stored.map((row) => [row.role, row.permissions]));

  return USER_ROLES.map((role) => ({
    role,
    permissions: { ...defaults, ...(storedMap.get(role) ?? {}) },
  }));
}

export async function upsertRolePermissions(
  role: string,
  permissions: Record<string, boolean>,
  updatedBy: string,
) {
  return db
    .insert(schema.rolePermissions)
    .values({ role, permissions, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.rolePermissions.role,
      set: { permissions, updatedBy, updatedAt: new Date() },
    });
}
