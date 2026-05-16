"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Carrot,
  Truck,
  AlertTriangle,
  ListChecks,
  Factory,
  Boxes,
  LineChart,
  Users,
  Settings,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/recipes", label: "Recipes", icon: BookOpen },
      { href: "/ingredients", label: "Ingredients", icon: Carrot },
      { href: "/suppliers", label: "Suppliers", icon: Truck, disabled: true },
      {
        href: "/allergens",
        label: "Allergens",
        icon: AlertTriangle,
        disabled: true,
      },
      { href: "/menus", label: "Menus", icon: ListChecks, disabled: true },
    ],
  },
  {
    title: "Planning",
    items: [
      { href: "/production", label: "Production", icon: Factory, disabled: true },
      { href: "/stock", label: "Stock", icon: Boxes, disabled: true },
      { href: "/analytics", label: "Analytics", icon: LineChart, disabled: true },
    ],
  },
  {
    title: "Team",
    items: [
      { href: "/members", label: "Members", icon: Users, disabled: true },
      { href: "/profile", label: "Profile", icon: UserCircle },
      { href: "/settings", label: "Settings", icon: Settings, disabled: true },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-forest-700 text-stone-100">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-white/5">
        <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm shadow-soft">
          ck
        </div>
        <span className="font-semibold tracking-tight text-white text-[15px]">
          CoreKitchen
        </span>
      </div>

      {/* Organization */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-2.5 py-2">
          <div className="h-7 w-7 rounded-md bg-brand-500/20 text-brand-200 flex items-center justify-center text-xs font-semibold">
            {user?.organizationName?.slice(0, 2).toUpperCase() ?? "CK"}
          </div>
          <span className="text-sm font-medium text-white truncate">
            {user?.organizationName ?? "Workspace"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-2xs font-semibold uppercase tracking-eyebrow text-stone-400/70">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, badge, disabled }) => {
                const active =
                  !disabled &&
                  (pathname === href || pathname.startsWith(href + "/"));
                if (disabled) {
                  return (
                    <span
                      key={href}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-stone-400/40 cursor-not-allowed"
                      aria-disabled
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{label}</span>
                    </span>
                  );
                }
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                      active
                        ? "bg-brand-500/15 text-white font-medium ring-1 ring-inset ring-brand-500/30"
                        : "text-stone-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        active ? "text-brand-300" : "text-stone-400"
                      )}
                    />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span className="text-2xs text-stone-400/80">{badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      {user && (
        <Link
          href="/profile"
          className="m-3 mt-0 flex items-center gap-2.5 rounded-lg bg-white/5 px-2.5 py-2 hover:bg-white/10 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-brand-500/30 text-brand-100 flex items-center justify-center text-xs font-semibold">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate leading-tight">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-2xs text-stone-400 truncate uppercase tracking-eyebrow">
              {user.role.toLowerCase()}
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
}
