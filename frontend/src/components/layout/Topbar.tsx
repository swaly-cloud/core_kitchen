"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User as UserIcon, Search, Bell, Command } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/recipes")) return "Recipes";
  if (pathname.startsWith("/ingredients")) return "Ingredients";
  if (pathname.startsWith("/profile")) return "Profile";
  return "Workspace";
}

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (!user) return null;

  const title = getPageTitle(pathname);

  return (
    <header className="h-16 border-b border-stone-200 bg-cream-100/80 backdrop-blur-sm flex items-center gap-4 px-4 md:px-6 sticky top-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm shrink-0">
        <span className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-500">
          Workspace
        </span>
        <span className="text-stone-300">/</span>
        <span className="font-medium text-stone-800">{title}</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto hidden sm:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search recipes, ingredients, suppliers..."
            className="w-full h-9 rounded-lg border border-stone-200 bg-white pl-9 pr-14 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 transition-colors"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-2xs text-stone-500 font-medium">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto sm:ml-0 shrink-0">
        <button
          className="relative h-9 w-9 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-warning ring-2 ring-cream-100" />
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full hover:bg-stone-100 pl-1 pr-2 py-1 transition-colors"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold">
              {getInitials(user.firstName, user.lastName)}
            </div>
          </button>

          {open ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 rounded-xl border border-stone-200 bg-white shadow-elevated py-2 z-50"
            >
              <div className="px-3 py-2 border-b border-stone-100 mb-1">
                <div className="font-medium text-stone-900 text-sm">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-stone-500 truncate">{user.email}</div>
              </div>
              <Link
                href="/profile"
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                onClick={() => setOpen(false)}
              >
                <UserIcon className="h-4 w-4" /> My profile
              </Link>
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  logout.mutate();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50/50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
