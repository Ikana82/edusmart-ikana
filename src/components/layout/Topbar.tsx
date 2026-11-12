"use client";

import { usePathname } from "next/navigation";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Search,
  GraduationCap,
} from "lucide-react";

type TopbarProps = {
  dark: boolean;
  setDark: (value: boolean) => void;
  onMenuClick: () => void;
  fullName: string;
  role: "admin" | "member";
};

export default function Topbar({
  dark,
  setDark,
  onMenuClick,
  fullName,
  role,
}: TopbarProps) {
  const pathname = usePathname();

  const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/lms-ecourse": "LMS - Ecourse",
    "/akses-tools": "Akses Tools",
    "/produk-mrr": "Produk MRR",
    "/setting": "Setting",
  };

  const pageTitle = pageTitles[pathname] || "Edusmart";
  const roleLabel = role === "admin" ? "Administrator" : "Member";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <header
      className={`sticky top-0 z-40 flex h-[76px] items-center justify-between border-b px-4 sm:px-6 lg:px-8 ${
        dark
          ? "border-[#33334b] bg-[#202033] text-white"
          : "border-[#eeeef4] bg-white text-[#25263a]"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 hover:bg-gray-100 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-200/40">
            <GraduationCap size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold">{pageTitle}</h2>
            <p
              className={`hidden text-xs sm:block ${
                dark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Welcome to your learning space
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* SEARCH */}
        <button
          type="button"
          aria-label="Search"
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
            dark
              ? "bg-[#303047] text-gray-300 hover:bg-[#3b3b55]"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Search size={19} />
        </button>

        {/* DARK MODE */}
        <button
          onClick={() => setDark(!dark)}
          className={`rounded-xl p-2.5 transition ${
            dark
              ? "bg-[#303047] text-yellow-300 hover:bg-[#3b3b55]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          aria-label="Ganti tema"
        >
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* NOTIFICATION */}
        <button
          className={`relative rounded-xl p-2.5 ${
            dark ? "bg-[#303047] text-gray-300" : "bg-gray-100 text-gray-600"
          }`}
          aria-label="Notifikasi"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* PROFILE */}
        <div
          className={`hidden items-center gap-3 border-l pl-4 sm:flex ${
            dark ? "border-[#44445c]" : "border-gray-200"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 font-bold text-white">
            {initial}
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold">{fullName}</p>
            <p
              className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              {roleLabel}
            </p>
          </div>

          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}
