"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Wrench,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";

type SidebarProps = {
  dark: boolean;
  mobileMenu: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "LMS - Ecourse",
    href: "/lms-ecourse",
    icon: GraduationCap,
  },
  {
    name: "Akses Tools",
    href: "/akses-tools",
    icon: Wrench,
  },
  {
    name: "Produk MRR",
    href: "/produk-mrr",
    icon: Package,
  },
];

export default function Sidebar({ dark, mobileMenu, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarTheme = dark
    ? "border-[#33334b] bg-[#202033] text-white"
    : "border-[#eeeef4] bg-white text-[#25263a]";

  const muted = dark ? "text-gray-400" : "text-gray-500";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileMenu && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[90] bg-black/50 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] flex w-[260px] flex-col overflow-y-auto border-r p-5 shadow-xl transition-transform duration-300 ease-in-out ${sidebarTheme} ${
          mobileMenu ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white">
              <GraduationCap size={25} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">Edusmart</h1>
              <p className={`text-[11px] ${muted}`}>by Ikanuraisma</p>
            </div>
          </div>

          {/* CLOSE MOBILE MENU */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-violet-100 hover:text-violet-700 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* MAIN MENU */}
        <div className="mt-10">
          <p
            className={`mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] ${muted}`}
          >
            Main Menu
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-200/40"
                      : `${muted} hover:bg-violet-50 hover:text-violet-600`
                  }`}
                >
                  <Icon size={19} />
                  {item.name}

                  {active && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* PREFERENCES */}
        <div className="mt-9">
          <p
            className={`mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] ${muted}`}
          >
            Preferences
          </p>

          <Link
            href="/setting"
            onClick={onClose}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition hover:bg-violet-50 hover:text-violet-600 ${
              isActive("/setting") ? "bg-violet-600 text-white" : muted
            }`}
          >
            <Settings size={19} />
            Setting
          </Link>
        </div>

        {/* LOGOUT */}
        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={() => {
              onClose();
              // Logout akan dihubungkan ke Supabase Auth.
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:text-red-500 ${muted}`}
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
