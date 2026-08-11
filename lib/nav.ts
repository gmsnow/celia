import {
  Banknote,
  Calendar,
  CalendarDays,
  CalendarRange,
  Circle,
  CircleOff,
  Clipboard,
  Coins,
  FolderMinus,
  FolderPlus,
  Gauge,
  LayoutDashboard,
  Layers,
  List,
  Network,
  Phone,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sunrise,
  Tags,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export interface SidebarLink {
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: SidebarLink[];
}

export interface SidebarSection {
  heading?: string;
  links: SidebarLink[];
}

export function getSidebarSections(t: Dictionary): SidebarSection[] {
  const s = t.sidebar;
  return [
    {
      links: [
        {
          label: s.dashboard,
          icon: Gauge,
          children: [{ label: s.dashboard, href: "/", icon: LayoutDashboard }],
        },
        {
          label: s.transferSystem,
          icon: Clipboard,
          children: [
            { label: s.transfersDashboard, href: "/transfers", icon: LayoutDashboard },
            { label: s.transferHistory, href: "/transfers/history", icon: FolderPlus },
            { label: s.transferDevices, href: "/transfers/devices", icon: Layers },
            { label: s.transferSettings, href: "/transfers/settings", icon: ShieldCheck },
          ],
        },
        {
          label: s.income,
          icon: Coins,
          children: [
            { label: s.dailyIncome, href: "/dailyIncome", icon: CalendarDays },
            { label: s.weeklyIncome, href: "/weeklyIncome", icon: CalendarRange },
            { label: s.monthlyIncome, href: "/monthlyIncome", icon: Calendar },
          ],
        },
        {
          label: s.incomeTotals,
          icon: List,
          children: [
            { label: s.totalHobani, href: "/totalOfHobani", icon: Network },
            { label: s.totalBalanceSales, href: "/totalOfbalence", icon: Phone },
            { label: s.totalSales, href: "/totalOfSelles", icon: ShoppingCart },
            { label: s.shifts, href: "/shifts", icon: Sunrise },
          ],
        },
        {
          label: s.sales,
          icon: Banknote,
          children: [
            { label: s.viewAllSales, href: "/allProduct", icon: List },
          ],
        },
        {
          label: s.expenses,
          icon: Wallet,
          children: [
            { label: s.viewExpenses, href: "/showExpenses", icon: Layers },
          ],
        },
        {
          label: s.advances,
          icon: CircleOff,
          children: [
            { label: s.viewAdvances, href: "/showAdvance", icon: FolderMinus },
          ],
        },
      ],
    },
    {
      heading: s.headingPricing,
      links: [
        {
          label: s.pricingSystem,
          icon: Tags,
          children: [
            { label: s.copyPrice, href: "/embedcopyPrice", icon: Receipt },
            {
              label: s.productPrices,
              icon: ShoppingBag,
              children: [
                { label: s.productPrices, href: "/embedProductPrice", icon: Circle },
              ],
            },
          ],
        },
      ],
    },
    {
      heading: s.headingPermissions,
      links: [
        {
          label: s.employeePermissions,
          icon: Users,
          children: [
            { label: s.manageEmployees, href: "/employees", icon: UsersRound },
            { label: s.manageUsers, href: "/users", icon: Circle },
            {
              label: s.employeeSalaries,
              icon: Banknote,
              children: [
                { label: s.editSalaries, href: "/salaryPage", icon: Circle },
              ],
            },
          ],
        },
      ],
    },
  ];
}
