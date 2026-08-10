import { z } from "zod";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { PERMISSION_KEYS } from "@/lib/roles/permissions";
import { USER_ROLES } from "@/lib/users/users";

export function createPermissionsSchema(t: Dictionary) {
  return z.object({
    role: z
      .string()
      .min(1, t.authorization.saveError)
      .refine((value) => (USER_ROLES as readonly string[]).includes(value), t.authorization.saveError),
    permissions: z.record(z.string(), z.boolean()).refine(
      (value) => (PERMISSION_KEYS as readonly string[]).every((key) => typeof value[key] === "boolean"),
      t.authorization.saveError,
    ),
  });
}

export type PermissionsInput = z.infer<ReturnType<typeof createPermissionsSchema>>;
