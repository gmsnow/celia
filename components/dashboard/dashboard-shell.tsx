"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { DashboardStats } from "@/lib/dashboard/stats";
import { useLocale } from "@/lib/i18n/locale-provider";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardShellProps {
  user: { name: string; role?: string | null; permissions?: string[] };
  todayLabel?: string;
  title?: string;
  titleKey?: string;
  breadcrumb?: BreadcrumbItem[];
  initialStats?: DashboardStats;
  children?: ReactNode;
}

function lookupTitle(dict: Dictionary, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], dict);
  return typeof value === "string" ? value : "";
}

const SIDEBAR_COLLAPSED_KEY = "celia-sidebar-collapsed";

const sidebarCollapsedListeners = new Set<() => void>();

function subscribeSidebarCollapsed(callback: () => void) {
  sidebarCollapsedListeners.add(callback);
  return () => {
    sidebarCollapsedListeners.delete(callback);
  };
}

function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
}

function toggleSidebarCollapsed() {
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, readSidebarCollapsed() ? "0" : "1");
  sidebarCollapsedListeners.forEach((callback) => callback());
}

export function DashboardShell({
  user,
  todayLabel,
  title,
  titleKey,
  breadcrumb,
  initialStats,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    readSidebarCollapsed,
    () => false,
  );
  const { locale, t } = useLocale();

  const resolvedTodayLabel = useMemo(
    () =>
      todayLabel ??
      new Date().toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [todayLabel, locale],
  );

  const resolvedTitle =
    title ?? (titleKey ? lookupTitle(t, titleKey) : t.dashboard.title);
  const resolvedBreadcrumb = breadcrumb ?? [
    { label: t.header.home, href: "/" },
    { label: resolvedTitle },
  ];

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleSidebarCollapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        permissions={user.permissions}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} onToggleSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-4">
            <h1 className="text-lg font-extrabold text-foreground">{resolvedTitle}</h1>
            <p className="text-xs text-muted-foreground">{resolvedTodayLabel}</p>
          </div>

          <nav className="mb-4 text-sm text-muted-foreground" aria-label={t.dashboard.breadcrumbLabel}>
            <ol className="flex items-center gap-1.5">
              {resolvedBreadcrumb.map((item, index) => (
                <li key={index} className="flex items-center gap-1.5">
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="font-semibold text-foreground" aria-current="page">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {initialStats ? <DashboardContent initialStats={initialStats} /> : children}
        </main>
      </div>
    </div>
  );
}
