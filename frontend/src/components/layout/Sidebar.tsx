"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, LayoutDashboard, BookOpen, UserCircle, Carrot } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingredients", label: "Ingrédients", icon: Carrot },
  { href: "/recipes", label: "Recettes", icon: BookOpen },
  { href: "/profile", label: "Profil", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 border-r border-zinc-200 bg-white flex flex-col">
      <div className="h-14 px-5 flex items-center gap-2 border-b border-zinc-200">
        <ChefHat className="h-5 w-5 text-brand-600" />
        <span className="font-semibold tracking-tight">CoreKitchen</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                active
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-zinc-700 hover:bg-zinc-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 text-xs text-zinc-400 border-t border-zinc-200">
        MVP v0.1
      </div>
    </aside>
  );
}
