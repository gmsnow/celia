"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Clock,
  FileText,
  LogOut,
  Mail,
  Maximize,
  Menu,
  MessageSquare,
  Minimize,
  Search,
  Star,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { roleLabel } from "@/lib/roles";
import { authClient } from "@/lib/auth-client";
import { useLocale } from "@/lib/i18n/locale-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface HeaderProps {
  user: { name: string; role?: string | null; permissions?: string[] };
  onToggleSidebar: () => void;
}

type OpenMenu = "messages" | "notifications" | "user" | null;

const SUPPORT_URL = "https://hitham-portofolio.netlify.app/#contact";

interface MessageItem {
  sender: string;
  starred: boolean;
  tone: string;
  bodyKey: "contactMe" | "gotYourMessage" | "topicHere";
  timeKey: "fourHoursAgo";
}

const MESSAGES: MessageItem[] = [
  {
    sender: "Brad Diesel",
    starred: true,
    tone: "text-red-500",
    bodyKey: "contactMe",
    timeKey: "fourHoursAgo",
  },
  {
    sender: "John Pierce",
    starred: false,
    tone: "text-muted-foreground",
    bodyKey: "gotYourMessage",
    timeKey: "fourHoursAgo",
  },
  {
    sender: "Nora Silvester",
    starred: true,
    tone: "text-amber-500",
    bodyKey: "topicHere",
    timeKey: "fourHoursAgo",
  },
];

const NOTIFICATIONS = [
  { icon: Mail, textKey: "fourNewMessages", timeKey: "threeMinutes" },
  { icon: Users, textKey: "friendRequests", timeKey: "twelveHours" },
  { icon: FileText, textKey: "newReports", timeKey: "twoDays" },
] as const;

export function Header({ user, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const canAccessHome =
    user.role === "admin" ||
    !user.permissions ||
    user.permissions.length === 0 ||
    user.permissions.includes("dashboard");

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

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
          onClick={onToggleSidebar}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
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
          <div className="relative">
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchOpen(false);
                }}
                className="absolute end-0 top-full mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-lg"
              >
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchRef}
                    type="search"
                    placeholder={t.header.searchPlaceholder}
                    className="h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </form>
            )}
          </div>

          <DropdownTrigger
            open={openMenu === "messages"}
            onClick={() => {
              setSearchOpen(false);
              setOpenMenu(openMenu === "messages" ? null : "messages");
            }}
            label={t.header.messages}
            badge="3"
            badgeClass="bg-red-500 text-white"
          >
            <MessageSquare className="size-5" aria-hidden="true" />
          </DropdownTrigger>

          <DropdownTrigger
            open={openMenu === "notifications"}
            onClick={() => {
              setSearchOpen(false);
              setOpenMenu(openMenu === "notifications" ? null : "notifications");
            }}
            label={t.header.notifications}
            badge="15"
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

      {openMenu === "messages" && (
        <DropdownPanel className="z-50" aria-label={t.header.messages}>
          <div className="border-b border-border px-4 py-2.5 text-sm font-bold text-foreground">
            {t.header.newMessages}
          </div>
          <div className="max-h-80 divide-y divide-border overflow-y-auto">
            {MESSAGES.map((message) => (
              <a
                key={message.sender}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted"
              >
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">
                  {message.sender.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-foreground">
                      {message.sender}
                    </span>
                    <Star
                      className={cn("size-3.5 shrink-0", message.tone)}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {t.messages[message.bodyKey]}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" aria-hidden="true" />
                    {t.messages[message.timeKey]}
                  </span>
                </span>
              </a>
            ))}
          </div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="block border-t border-border px-4 py-2.5 text-center text-sm font-bold text-primary transition-colors hover:bg-muted"
          >
            {t.header.viewAllMessages}
          </a>
        </DropdownPanel>
      )}

      {openMenu === "notifications" && (
        <DropdownPanel className="z-50" aria-label={t.header.notifications}>
          <div className="border-b border-border px-4 py-2.5 text-sm font-bold text-foreground">
            {t.header.notificationsCount}
          </div>
          <div className="max-h-80 divide-y divide-border overflow-y-auto">
            {NOTIFICATIONS.map((item) => (
              <a
                key={item.textKey}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <item.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="truncate text-foreground">{t.messages[item.textKey]}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t.messages[item.timeKey]}
                </span>
              </a>
            ))}
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
