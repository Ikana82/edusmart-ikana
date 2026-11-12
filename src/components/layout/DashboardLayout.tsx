"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { createClient } from "@/lib/supabase/client";

type DashboardLayoutProps = {
  children: React.ReactNode;
  dark: boolean;
  setDark: (value: boolean) => void;
};

export default function DashboardLayout({
  children,
  dark,
  setDark,
}: DashboardLayoutProps) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [fullName, setFullName] = useState("Pengguna");
  const [role, setRole] = useState<"admin" | "member">("member");

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function getUserProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isMounted) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (!error && data) {
        setFullName(data.full_name?.trim() || "Nama belum tersedia");

        if (data.role === "admin" || data.role === "member") {
          setRole(data.role);
        }
      }
    }

    getUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-[#151522] text-white" : "bg-[#f7f8fc] text-[#25263a]"
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
          role={role}
        />

        <main className="min-h-[calc(100vh-76px)]">{children}</main>
      </div>
    </div>
  );
}
