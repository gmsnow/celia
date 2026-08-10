"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Save, ShieldCheck, XCircle } from "lucide-react";
import type { RolePermissionRow } from "@/lib/roles/queries";
import { PERMISSION_GROUPS, type PermissionKey } from "@/lib/roles/permissions";
import { USER_ROLES } from "@/lib/users/users";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface PermissionsViewProps {
  initialData: RolePermissionRow[];
}

const selectClassName =
  "flex h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm text-foreground shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 appearance-none";

export function PermissionsView({ initialData }: PermissionsViewProps) {
  const { locale, t } = useLocale();
  const at = t.authorization;

  const [selectedRole, setSelectedRole] = useState<string>(USER_ROLES[0]);
  const [byRole, setByRole] = useState<Record<string, Record<string, boolean>>>(
    () => Object.fromEntries(initialData.map((row) => [row.role, { ...row.permissions }])),
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const current = byRole[selectedRole] ?? {};

  function roleLabel(role: string): string {
    return t.roles[role as keyof typeof t.roles] ?? role;
  }

  const permissionLabel = useMemo(() => {
    const labels = at.permissions as unknown as Record<string, string>;
    return (key: string) => labels[key] ?? key;
  }, [at.permissions]);

  function toggle(key: PermissionKey) {
    setMessage(null);
    setByRole((prev) => ({
      ...prev,
      [selectedRole]: { ...prev[selectedRole], [key]: !(prev[selectedRole]?.[key] ?? false) },
    }));
  }

  async function handleSave() {
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/authorization", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({ role: selectedRole, permissions: current }),
      });
      const data = (await res.json()) as { message?: string; error?: string };

      if (res.ok) {
        setMessage({ type: "success", text: data.message ?? at.saved });
      } else {
        setMessage({ type: "error", text: data.error ?? at.saveError });
      }
    } catch {
      setMessage({ type: "error", text: at.saveError });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <div className="flex h-fit flex-col rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-foreground">{at.roles}</h2>
            <p className="text-xs text-muted-foreground">{at.subtitle}</p>
          </div>
        </div>
        <div className="p-5">
          <label htmlFor="roleSelect" className="mb-1.5 block text-xs font-bold text-muted-foreground">
            {at.selectRole}
          </label>
          <div className="relative">
            <select
              id="roleSelect"
              value={selectedRole}
              onChange={(e) => {
                setMessage(null);
                setSelectedRole(e.target.value);
              }}
              className={selectClassName}
            >
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-extrabold text-foreground">
              {at.permissionsTitle.replace("{role}", roleLabel(selectedRole))}
            </h2>
            <p className="text-xs text-muted-foreground">
              {Object.values(current).filter(Boolean).length} / {Object.keys(current).length}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {message && (
            <div
              role="alert"
              className={cn(
                "flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium",
                message.type === "success"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-destructive/30 bg-destructive/10 text-destructive",
              )}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {PERMISSION_GROUPS.map((group) => {
              const groupTitle = at.groups[group.key as keyof typeof at.groups];
              const checkedCount = group.keys.filter((key) => current[key]).length;
              return (
                <div
                  key={group.key}
                  className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center justify-between bg-primary px-4 py-2.5 text-white">
                    <h3 className="text-sm font-extrabold">{groupTitle}</h3>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
                      {checkedCount}/{group.keys.length}
                    </span>
                  </div>
                  <ul className="space-y-1 p-3">
                    {group.keys.map((key) => (
                      <li key={key}>
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted">
                          <span>{permissionLabel(key)}</span>
                          <input
                            type="checkbox"
                            checked={!!current[key]}
                            onChange={() => toggle(key)}
                            className="size-4 shrink-0 accent-primary"
                          />
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-end gap-3 border-t border-border px-5 py-4">
          <Button type="button" variant="success" size="lg" onClick={handleSave} loading={loading}>
            <Save className="size-4" aria-hidden="true" />
            {loading ? at.saving : at.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
