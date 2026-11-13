"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { createClient } from "@/lib/supabase/client";

type DashboardLayoutProps = {
  children: React.ReactNode;
  dark: boolean;
  setDark: (value: boolean) => void;
};

const validThemes = ["purple", "blue", "pink", "green", "orange", "slate"];
type ProfileUpdatedDetail = {
  fullName?: string;
  avatarUrl?: string | null;
};

export default function DashboardLayout({
  children,
  dark,
  setDark,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [fullName, setFullName] = useState("Pengguna");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "member">("member");

  useEffect(() => {
    const savedDark =
      window.localStorage.getItem("edusmart_dark_mode") === "true";
    const nextDark =
      window.localStorage.getItem("edusmart_dark_mode") === null
        ? dark
        : savedDark;
    if (nextDark !== dark) setDark(nextDark);
    document.documentElement.dataset.dark = nextDark ? "true" : "false";
  }, [dark, setDark]);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;
    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      if (typeof detail?.fullName === "string") {
        setFullName(detail.fullName.trim() || "Nama belum tersedia");
      }
      if (Object.prototype.hasOwnProperty.call(detail ?? {}, "avatarUrl")) {
        setAvatarUrl(detail.avatarUrl ?? null);
      }
    };

    window.addEventListener("edusmart-profile-updated", handleProfileUpdated);

    async function getUserProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isMounted) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url, theme")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (!error && data) {
        setFullName(data.full_name?.trim() || "Nama belum tersedia");
        setAvatarUrl(data.avatar_url ?? null);

        if (data.role === "admin" || data.role === "member") {
          setRole(data.role);
        }

        const savedTheme = validThemes.includes(data.theme)
          ? data.theme
          : "purple";

        document.documentElement.dataset.theme = savedTheme;
      }
    }

    void getUserProfile();

    return () => {
      isMounted = false;
      window.removeEventListener(
        "edusmart-profile-updated",
        handleProfileUpdated,
      );
    };
  }, [dark, pathname, setDark]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark
          ? "bg-[#151522] text-white"
          : "bg-[var(--background)] text-[var(--foreground)]"
      }`}
    >
      <Sidebar
        dark={dark}
        mobileMenu={mobileMenu}
        onClose={() => setMobileMenu(false)}
      />

      <div className="min-h-screen lg:pl-[260px]">
        <Topbar
          dark={dark}
          setDark={setDark}
          onMenuClick={() => setMobileMenu(true)}
          fullName={fullName}
          avatarUrl={avatarUrl}
          role={role}
        />

        <main className="min-h-[calc(100vh-76px)]">{children}</main>
      </div>
    </div>
  );
}
