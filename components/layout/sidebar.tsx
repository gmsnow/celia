"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { getSidebarSections, type SidebarLink } from "@/lib/nav";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Logo } from "@/components/brand/logo";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLocale();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [toggled, setToggled] = useState<Set<string>>(() => new Set());

  const sections = getSidebarSections(t);

  function toggle(label: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
    setToggled((prev) => new Set(prev).add(label));
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex w-72 flex-col border-e border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label={t.header.closeMenu}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {sections.map((section, sectionIndex) => (
            <div key={section.heading ?? `section-${sectionIndex}`}>
              {section.heading && (
                <div className="mb-1 px-3 pt-3 text-[11px] font-bold tracking-wide text-muted-foreground/70">
                  {section.heading}
                </div>
              )}
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <TreeItem
                    key={link.label}
                    link={link}
                    depth={0}
                    expanded={expanded}
                    toggled={toggled}
                    onToggle={toggle}
                    pathname={pathname}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

interface TreeItemProps {
  link: SidebarLink;
  depth: number;
  expanded: Set<string>;
  toggled: Set<string>;
  onToggle: (label: string) => void;
  pathname: string;
}

function TreeItem({ link, depth, expanded, toggled, onToggle, pathname }: TreeItemProps) {
  const children = link.children ?? [];
  const hasChildren = children.length > 0;

  if (hasChildren) {
    const userToggled = toggled.has(link.label);
    const isExpanded = userToggled ? expanded.has(link.label) : containsActive(link, pathname);
    const hasActiveChild = containsActive(link, pathname);

    return (
      <li>
        <button
          type="button"
          onClick={() => onToggle(link.label)}
          aria-expanded={isExpanded}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
            hasActiveChild
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <span className="flex min-w-0 items-center gap-3">
            {link.icon && <link.icon className="size-4 shrink-0" aria-hidden="true" />}
            <span className="truncate">{link.label}</span>
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
        {isExpanded && (
          <ul className={cn("mt-1 space-y-1", depth === 0 && "ps-3")}>
            {children.map((child) => (
              <TreeItem
                key={child.label}
                link={child}
                depth={depth + 1}
                expanded={expanded}
                toggled={toggled}
                onToggle={onToggle}
                pathname={pathname}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const active = link.href === pathname;

  return (
    <li>
      <Link
        href={link.href ?? "#"}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
          active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {link.icon && <link.icon className="size-4 shrink-0" aria-hidden="true" />}
        <span className="truncate">{link.label}</span>
      </Link>
    </li>
  );
}

function containsActive(link: SidebarLink, pathname: string): boolean {
  if (link.href === pathname) return true;
  return !!link.children?.some((child) => containsActive(child, pathname));
}
