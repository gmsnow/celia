"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Bell,
  Box,
  ChevronDown,
  Coins,
  Copy,
  CreditCard,
  HardDrive,
  LogOut,
  Maximize,
  Menu,
  Minimize,
  Percent,
  Search,
  ShoppingCart,
  Truck,
  User,
  UserCog,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { roleLabel } from "@/lib/roles";
import { authClient } from "@/lib/auth-client";
import { useLocale } from "@/lib/i18n/locale-provider";
import { filterSections, flattenPages, getSidebarSections } from "@/lib/nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface HeaderProps {
  user: { name: string; role?: string | null; permissions?: string[] };
  onToggleSidebar: () => void;
  onToggleCollapsed: () => void;
}

type OpenMenu = "notifications" | "user" | null;

const SUPPORT_URL = "https://hitham-portofolio.netlify.app/#contact";

interface NotificationItem {
  id: string;
  type: string;
  action: string;
  messageKey: string;
  messageParams?: Record<string, string | number> | null;
  actorName?: string | null;
  isRead: boolean;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  expense: Coins,
  advance: Wallet,
  product: Box,
  sale: ShoppingCart,
  employee: User,
  user: UserCog,
  balance: CreditCard,
  hobani: Banknote,
  copyPrice: Percent,
  transfer: Copy,
  agent: Truck,
  nasShare: HardDrive,
  device: HardDrive,
};

function interpolate(
  template: string,
  params?: Record<string, string | number> | null,
): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{${key}}`, String(value)),
    template,
  );
}

function formatRelativeTime(iso: string, locale: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const minutes = Math.round(Math.abs(diffMs) / 60000);
  if (minutes < 1) return rtf.format(0, "minute");
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 30) return rtf.format(-days, "day");
  const months = Math.round(days / 30);
  if (months < 12) return rtf.format(-months, "month");
  return rtf.format(-Math.round(months / 12), "year");
}

export function Header({ user, onToggleSidebar, onToggleCollapsed }: HeaderProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchRootRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
    } catch {
      // ignore fetch errors
    }
  }, []);

  const markNotificationsRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch {
      // ignore fetch errors
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    const run = async () => {
      if (stopped) return;
      await loadNotifications();
    };
    void run();
    return () => {
      stopped = true;
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (openMenu !== "notifications") return;
    let stopped = false;
    const run = async () => {
      if (stopped) return;
      await loadNotifications();
      await markNotificationsRead();
    };
    void run();
    return () => {
      stopped = true;
    };
  }, [openMenu, loadNotifications, markNotificationsRead]);

  const canAccessHome =
    user.role === "admin" ||
    !user.permissions ||
    user.permissions.length === 0 ||
    user.permissions.includes("dashboard");

  const pages = useMemo(() => {
    const sections =
      user.role === "admin"
        ? getSidebarSections(t)
        : filterSections(getSidebarSections(t), user.permissions ?? []);
    return flattenPages(sections);
  }, [t, user.role, user.permissions]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pages.filter((page) => page.label.toLowerCase().includes(q)).slice(0, 8);
  }, [pages, query]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (searchRootRef.current && !searchRootRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  function goToPage(href: string) {
    closeSearch();
    router.push(href);
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      closeSearch();
    } else if (event.key === "Enter") {
      if (results.length > 0) {
        event.preventDefault();
        goToPage(results[0].href);
      }
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex h-16 items-center gap-1 px-2 sm:px-4">
        <button
          type="button"
          onClick={() => {
            if (window.matchMedia("(min-width: 640px)").matches) {
              onToggleCollapsed();
            } else {
              onToggleSidebar();
            }
          }}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
          aria-label={t.header.openMenu}
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        <nav className="hidden items-center md:flex" aria-label={t.header.quickLinks}>
          {canAccessHome && (
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t.header.home}
            </Link>
          )}
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t.header.support}
          </a>
        </nav>

        <div className="ms-auto flex items-center gap-0.5">
          <div className="relative" ref={searchRootRef}>
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                setSearchOpen((v) => !v);
              }}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t.header.search}
            >
              <Search className="size-5" aria-hidden="true" />
            </button>
            {searchOpen && (
              <div className="absolute end-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (results.length > 0) goToPage(results[0].href);
                  }}
                >
                  <div className="relative border-b border-border p-2">
                    <Search
                      className="pointer-events-none absolute start-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      ref={searchRef}
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={onSearchKeyDown}
                      placeholder={t.header.searchPlaceholder}
                      className="h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                </form>
                <div className="max-h-72 overflow-y-auto p-1">
                  {query.trim() ? (
                    results.length > 0 ? (
                      <ul role="listbox" aria-label={t.header.searchResults}>
                        {results.map((page) => (
                          <li key={page.href} role="option" aria-selected="false">
                            <button
                              type="button"
                              onClick={() => goToPage(page.href)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm text-foreground transition-colors hover:bg-muted"
                            >
                              {page.icon && <page.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                              <span className="min-w-0 truncate">{page.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-3 py-3 text-center text-sm text-muted-foreground">
                        {t.header.noResults}
                      </p>
                    )
                  ) : (
                    <p className="px-3 py-3 text-center text-sm text-muted-foreground">
                      {t.header.searchHint}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DropdownTrigger
            open={openMenu === "notifications"}
            onClick={() => {
              setSearchOpen(false);
              setOpenMenu(openMenu === "notifications" ? null : "notifications");
            }}
            label={t.header.notifications}
            badge={unreadCount > 0 ? String(unreadCount) : undefined}
            badgeClass="bg-amber-500 text-white"
          >
            <Bell className="size-5" aria-hidden="true" />
          </DropdownTrigger>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={isFullscreen ? t.header.exitFullscreen : t.header.fullscreen}
          >
            {isFullscreen ? (
              <Minimize className="size-5" aria-hidden="true" />
            ) : (
              <Maximize className="size-5" aria-hidden="true" />
            )}
          </button>

          <LanguageSwitcher />

          <ThemeToggle />

          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setOpenMenu(openMenu === "user" ? null : "user");
            }}
            className={cn(
              "ms-1 flex items-center gap-2 rounded-lg p-1.5 text-sm font-semibold transition-colors hover:bg-muted",
              openMenu === "user" && "bg-muted",
            )}
            aria-haspopup="menu"
            aria-expanded={openMenu === "user"}
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
              {user.name?.trim().charAt(0) || t.common.initial}
            </span>
            <span className="hidden max-w-28 truncate text-foreground md:inline">
              {user.name}
            </span>
            <ChevronDown className="hidden size-4 text-muted-foreground md:block" aria-hidden="true" />
          </button>
        </div>
      </div>

      {openMenu || searchOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-10"
              onClick={() => {
                setOpenMenu(null);
                setSearchOpen(false);
              }}
              aria-hidden="true"
            />,
            document.body,
          )
        : null}

      {openMenu === "notifications" && (
        <DropdownPanel className="z-50" aria-label={t.header.notifications}>
          <div className="border-b border-border px-4 py-2.5 text-sm font-bold text-foreground">
            {t.header.notificationsCount.replace("{count}", String(notifications.length))}
          </div>
          <div className="max-h-80 divide-y divide-border overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {t.header.notificationsEmpty}
              </p>
            ) : (
              notifications.map((item) => {
                const Icon = NOTIFICATION_ICONS[item.type] ?? Bell;
                const key = item.messageKey.startsWith("notifications.")
                  ? item.messageKey.slice("notifications.".length)
                  : item.messageKey;
                const template =
                  (t.notifications as Record<string, string>)[key] ?? item.messageKey;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span
                        className={cn(
                          "min-w-0",
                          item.isRead ? "text-muted-foreground" : "font-semibold text-foreground",
                        )}
                      >
                        <span className="block truncate">
                          {interpolate(template, item.messageParams)}
                        </span>
                        {item.actorName && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.actorName}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(item.createdAt, locale)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="block border-t border-border px-4 py-2.5 text-center text-sm font-bold text-primary transition-colors hover:bg-muted"
          >
            {t.header.viewAllNotifications}
          </a>
        </DropdownPanel>
      )}

      {openMenu === "user" && (
        <DropdownPanel className="z-50 w-72" aria-label={t.header.userMenu}>
          <div className="bg-primary px-4 py-5 text-center text-primary-foreground">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/20 text-xl font-extrabold">
              {user.name?.trim().charAt(0) || t.common.initial}
            </span>
            <p className="mt-2 text-sm font-bold">{user.name}</p>
            <p className="text-xs text-primary-foreground/80">
              {roleLabel(user.role ?? "employee", t)}
            </p>
          </div>
          <div className="border-b border-border px-1 py-2">
            <div className="grid grid-cols-3 text-center text-sm">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="rounded-lg px-2 py-1.5 font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t.header.followers}
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="rounded-lg px-2 py-1.5 font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t.header.sales}
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="rounded-lg px-2 py-1.5 font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t.header.friends}
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-3">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <User className="size-4" aria-hidden="true" />
              {t.header.profile}
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t.header.signOut}
            </button>
          </div>
        </DropdownPanel>
      )}
    </header>
  );
}

interface DropdownTriggerProps {
  open: boolean;
  onClick: () => void;
  label: string;
  badge?: string;
  badgeClass?: string;
  children: React.ReactNode;
}

function DropdownTrigger({
  open,
  onClick,
  label,
  badge,
  badgeClass,
  children,
}: DropdownTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        open && "bg-muted text-foreground",
      )}
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={open}
    >
      {children}
      {badge && (
        <span
          className={cn(
            "absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
            badgeClass,
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

interface DropdownPanelProps {
  className?: string;
  "aria-label"?: string;
  children: React.ReactNode;
}

function DropdownPanel({ className, ...props }: DropdownPanelProps) {
  return (
    <div
      className={cn(
        "absolute end-2 top-full mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg",
        className,
      )}
      {...props}
    />
  );
}
