"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
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

  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-6">
      <div className="text-sm text-zinc-500">{user.organizationName}</div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 rounded-full hover:bg-zinc-100 px-2 py-1 transition-colors"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-medium">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="text-sm text-left hidden sm:block">
            <div className="font-medium text-zinc-900 leading-tight">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-zinc-500 leading-tight">{user.email}</div>
          </div>
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 rounded-md border border-zinc-200 bg-white shadow-lg py-1 z-50"
          >
            <Link
              href="/profile"
              role="menuitem"
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              onClick={() => setOpen(false)}
            >
              <UserIcon className="h-4 w-4" /> Mon profil
            </Link>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout.mutate();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Se déconnecter
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
