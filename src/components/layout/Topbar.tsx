"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  GraduationCap,
  Settings,
  LogOut,
} from "lucide-react";

type TopbarProps = {
  dark: boolean;
  setDark: (value: boolean) => void;
  onMenuClick: () => void;
  fullName: string;
  avatarUrl: string | null;
  role: "admin" | "member";
};

const presetAvatars: Record<string, string> = {
  girl: "👩🏻‍🎓",
  hijab: "🧕🏻",
  teacher: "👩🏻‍🏫",
  creator: "👩🏻‍💻",
  boy: "👨🏻‍🎓",
  "boy-creator": "👨🏻‍💻",
  artist: "🧑🏻‍🎨",
  bear: "🐻",
  cat: "🐱",
  rabbit: "🐰",
  fox: "🦊",
  panda: "🐼",
  robot: "🤖",
  star: "🌟",
  flower: "🌸",
  rainbow: "🌈",
};

export default function Topbar({
  dark,
  setDark,
  onMenuClick,
  fullName,
  avatarUrl,
  role,
}: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/lms-ecourse": "LMS - Ecourse",
    "/akses-tools": "Akses Tools",
    "/produk-mrr": "Produk MRR",
    "/setting": "Setting",
  };

  const pageTitle = pageTitles[pathname] || "Edusmart";
  const roleLabel = role === "admin" ? "Administrator" : "Member";

  const initial =
    (fullName || "Pengguna").trim().charAt(0).toUpperCase() || "P";

  const presetEmoji = avatarUrl?.startsWith("preset:")
    ? presetAvatars[avatarUrl.slice(7)]
    : null;

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout gagal:", error);
      toast.error("Gagal keluar dari akun. Silakan coba lagi.");
      setLoggingOut(false);
      return;
    }

    toast.success("Berhasil keluar dari akun.");
    router.replace("/login");
    router.refresh();
  };

  const handleSetting = () => {
    setProfileMenuOpen(false);
    router.push("/setting");
  };

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white">
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
        <button
          onClick={() => {
            const nextDark = !dark;
            setDark(nextDark);
            window.localStorage.setItem("edusmart_dark_mode", String(nextDark));
            document.documentElement.dataset.dark = String(nextDark);
          }}
          className={`rounded-xl p-2.5 transition ${
            dark
              ? "bg-[#303047] text-yellow-300 hover:bg-[#3b3b55]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          aria-label="Ganti tema"
        >
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <button
          className={`relative rounded-xl p-2.5 ${
            dark ? "bg-[#303047] text-gray-300" : "bg-gray-100 text-gray-600"
          }`}
          aria-label="Notifikasi"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* PROFILE DROPDOWN */}
        <div
          className={`relative border-l pl-3 sm:pl-4 ${
            dark ? "border-[#44445c]" : "border-gray-200"
          }`}
        >
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 sm:gap-3"
            aria-label="Menu profil"
            aria-expanded={profileMenuOpen}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-[var(--theme-primary)]">
              {presetEmoji ? (
                <span className="text-2xl">{presetEmoji}</span>
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Foto profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--theme-secondary)] to-[var(--theme-primary)] font-bold text-white">
                  {initial}
                </div>
              )}
            </div>

            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold">{fullName}</p>
              <p
                className={`text-xs ${
                  dark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {roleLabel}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`transition-transform ${
                profileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileMenuOpen && (
            <>
              {/* Klik area luar untuk menutup dropdown */}
              <button
                type="button"
                aria-label="Tutup menu profil"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setProfileMenuOpen(false)}
              />

              <div
                className={`absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border shadow-xl ${
                  dark
                    ? "border-[#41415b] bg-[#292940] text-white"
                    : "border-gray-100 bg-white text-gray-800"
                }`}
              >
                <div
                  className={`border-b px-4 py-3 ${
                    dark ? "border-[#41415b]" : "border-gray-100"
                  }`}
                >
                  <p className="truncate text-sm font-semibold">{fullName}</p>
                  <p
                    className={`text-xs ${
                      dark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {roleLabel}
                  </p>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={handleSetting}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      dark ? "hover:bg-[#383852]" : "hover:bg-gray-100"
                    }`}
                  >
                    <Settings size={18} />
                    Pengaturan Akun
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-500/10"
                  >
                    <LogOut size={18} />
                    {loggingOut ? "Sedang keluar..." : "Logout"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
