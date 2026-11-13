"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AppFooter from "@/components/layout/AppFooter";
import { createClient } from "@/lib/supabase/client";
import {
  GraduationCap,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Clock3,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  ChartNoAxesCombined,
  Wrench,
} from "lucide-react";

const courses = [
  {
    title: "Fundamental AI",
    subtitle: "Memahami dasar kecerdasan buatan",
    lessons: 16,
    progress: 75,
    color: "bg-[var(--theme-soft)] text-[var(--theme-primary)]",
    icon: Sparkles,
  },
  {
    title: "AI Tools Creator",
    subtitle: "Belajar membangun AI Tools",
    lessons: 14,
    progress: 35,
    color: "bg-[var(--theme-soft)] text-[var(--theme-primary)]",
    icon: Wrench,
  },
  {
    title: "Website Builder",
    subtitle: "Membangun website profesional",
    lessons: 12,
    progress: 0,
    color: "bg-[var(--theme-soft)] text-[var(--theme-primary)]",
    icon: ChartNoAxesCombined,
  },
];

const activities = [
  {
    title: "Menyelesaikan materi Fundamental AI",
    time: "Hari ini",
    icon: CheckCircle2,
  },
  {
    title: "Menonton video pengenalan AI Tools",
    time: "Kemarin",
    icon: PlayCircle,
  },
  {
    title: "Memulai kelas Website Builder",
    time: "2 hari lalu",
    icon: BookOpen,
  },
  {
    title: "Menyelesaikan latihan AI Prompting",
    time: "3 hari lalu",
    icon: CheckCircle2,
  },
  {
    title: "Mempelajari dasar AI Tools Creator",
    time: "4 hari lalu",
    icon: Wrench,
  },
];

type DashboardStats = {
  classes: number;
  videos: number;
  materials: number;
  tools: number;
};

export default function DashboardPage() {
  const [dark, setDark] = useState(false);
  const [activityPage, setActivityPage] = useState(1);

  const [stats, setStats] = useState<DashboardStats>({
    classes: 0,
    videos: 0,
    materials: 0,
    tools: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const loadDashboardStats = async () => {
      setStatsLoading(true);

      const [classesResult, materialsResult, videosResult, toolsResult] =
        await Promise.all([
          supabase
            .from("lms_programs")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("lms_materials")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("lms_materials")
            .select("*", { count: "exact", head: true })
            .eq("type", "video"),
          supabase.from("ai_tools").select("*", { count: "exact", head: true }),
        ]);

      if (!mounted) return;

      setStats({
        classes: classesResult.count ?? 0,
        videos: videosResult.count ?? 0,
        materials: materialsResult.count ?? 0,
        tools: toolsResult.count ?? 0,
      });
      setStatsLoading(false);
    };

    loadDashboardStats();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const loadProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (mounted) setProfileLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      setUserProfile({
        name: profile?.full_name?.trim() || "Nama belum tersedia",
        email: user.email || "",
        role: profileError
          ? "Member"
          : profile?.role === "admin"
            ? "Administrator"
            : "Member",
      });

      setProfileLoading(false);
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const activityPageSize = 4;
  const totalActivityPages = Math.ceil(activities.length / activityPageSize);
  const paginatedActivities = activities.slice(
    (activityPage - 1) * activityPageSize,
    activityPage * activityPageSize,
  );

  const card = dark
    ? "bg-[#202033] border-[#33334b]"
    : "bg-white border-[#ececf3]";

  const muted = dark ? "text-gray-400" : "text-gray-500";

  const statistics = [
    {
      label: "Total Kelas",
      value: stats.classes,
      icon: BookOpen,
      color: "bg-[var(--theme-soft)] text-[var(--theme-primary)]",
    },
    {
      label: "Video Pembelajaran",
      value: stats.videos,
      icon: PlayCircle,
      color: "bg-[var(--theme-soft)] text-[var(--theme-primary)]",
    },
    {
      label: "Total Materi",
      value: stats.materials,
      icon: CheckCircle2,
      color: "bg-[var(--theme-soft)] text-[var(--theme-primary)]",
    },
    {
      label: "Total AI Tools",
      value: stats.tools,
      icon: Wrench,
      color: "bg-[var(--theme-soft)] text-[var(--theme-primary)]",
    },
  ];

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <div className="mx-auto w-full max-w-363 space-y-6 p-4 sm:p-6 lg:space-y-7 lg:p-9">
        {/* WELCOME BANNER */}
        <section
          className="relative overflow-hidden rounded-3xl p-7 text-white md:p-10"
          style={{
            background:
              "linear-gradient(110deg, var(--theme-primary), var(--theme-secondary))",
          }}
        >
          <div className="relative z-10 max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              <Sparkles size={14} />
              DIGITAL LEARNING PLATFORM
            </div>

            <h2 className="text-2xl font-bold leading-tight md:text-3xl">
              Selamat Datang di Edusmart!
            </h2>

            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 md:text-base">
              Tempat belajar, mengembangkan kreativitas, dan membangun masa
              depan sebagai digital creator.
            </p>

            <a
              href="/lms-ecourse"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold transition hover:bg-white/90"
              style={{ color: "var(--theme-primary)" }}
            >
              Mulai Belajar <ArrowRight size={16} />
            </a>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute right-12 top-10 hidden text-white/20 md:block">
            <GraduationCap size={145} />
          </div>
        </section>

        {/* STATISTICS - DATA DARI SUPABASE */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-5 ${card}`}>
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon size={20} />
              </div>

              <p className={`text-sm ${muted}`}>{stat.label}</p>

              <h3 className="mt-1 text-2xl font-bold tracking-tight">
                {statsLoading ? "…" : stat.value.toLocaleString("id-ID")}
              </h3>
            </div>
          ))}
        </section>

        {/* COURSES */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold">Lanjutkan Pembelajaran</h3>
              <p className={`mt-1 text-sm ${muted}`}>
                Lanjutkan kelas yang sedang kamu pelajari.
              </p>
            </div>

            <a
              href="/lms-ecourse"
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--theme-primary)]"
            >
              Lihat Semua <ArrowRight size={15} />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.title}
                className={`overflow-hidden rounded-2xl border ${card}`}
              >
                <div
                  className={`flex h-32 items-center justify-center ${course.color.split(" ")[0]}`}
                >
                  <course.icon
                    size={48}
                    className={course.color.split(" ")[1]}
                  />
                </div>

                <div className="p-5">
                  <p className="text-base font-bold">{course.title}</p>
                  <p className={`mt-1 text-xs ${muted}`}>{course.subtitle}</p>

                  <div className={`mt-4 flex justify-between text-xs ${muted}`}>
                    <span>{course.lessons} Materi</span>
                    <span className="font-bold text-[var(--theme-primary)]">
                      {course.progress}%
                    </span>
                  </div>

                  <div
                    className={`mt-2 h-1.5 overflow-hidden rounded-full ${
                      dark ? "bg-[#3a3a52]" : "bg-gray-100"
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--theme-primary)]"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <a
                    href="/lms-ecourse"
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                      dark
                        ? "bg-[#30304a] text-white hover:brightness-110"
                        : "bg-[var(--theme-soft)] text-[var(--theme-primary)] hover:brightness-95 hover:text-[var(--theme-primary)]"
                    }`}
                  >
                    {course.progress === 0
                      ? "Mulai Belajar"
                      : "Lanjutkan Belajar"}
                    <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CONTENT */}
        <section className="grid gap-5 xl:grid-cols-3">
          {/* AKTIVITAS PEMBELAJARAN */}
          <div className={`rounded-2xl border p-6 xl:col-span-2 ${card}`}>
            <h3 className="text-base font-bold">Aktivitas Pembelajaran</h3>
            <p className={`mt-1 text-sm ${muted}`}>
              Ringkasan aktivitas belajar kamu.
            </p>

            <div className="mt-6 flex min-h-[280px] flex-col">
              <div className="flex-1 space-y-5">
                {paginatedActivities.map((item) => (
                  <div key={item.title} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--theme-soft)] text-[var(--theme-primary)]">
                      <item.icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className={`mt-1 text-xs ${muted}`}>{item.time}</p>
                    </div>

                    <ChevronRight size={17} className={`shrink-0 ${muted}`} />
                  </div>
                ))}
              </div>

              {totalActivityPages > 1 && (
                <div
                  className={`mt-6 flex items-center justify-between border-t pt-4 ${
                    dark ? "border-[#33334b]" : "border-gray-100"
                  }`}
                >
                  <p className={`text-xs ${muted}`}>
                    Halaman {activityPage} dari {totalActivityPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setActivityPage((page) => Math.max(1, page - 1))
                      }
                      disabled={activityPage === 1}
                      aria-label="Halaman sebelumnya"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <button
                      onClick={() =>
                        setActivityPage((page) =>
                          Math.min(totalActivityPages, page + 1),
                        )
                      }
                      disabled={activityPage === totalActivityPages}
                      aria-label="Halaman berikutnya"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ backgroundColor: "var(--theme-primary)" }}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PROFIL PENGGUNA - DATA DARI SUPABASE AUTH */}
          <div className={`rounded-2xl border p-6 ${card}`}>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[var(--theme-primary)]" />
              <h3 className="text-base font-bold">Profil Pengguna</h3>
            </div>

            <div className="mt-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--theme-soft)] text-2xl font-bold uppercase text-[var(--theme-primary)]">
                {profileLoading ? "…" : userProfile.name.charAt(0) || "?"}
              </div>

              <h4 className="mt-3 break-words text-base font-bold">
                {profileLoading
                  ? "Memuat profil..."
                  : userProfile.name || "Pengguna"}
              </h4>

              <p className={`mt-1 text-xs ${muted}`}>
                {profileLoading ? " " : userProfile.role}
              </p>
              <p className={`mt-1 break-all text-xs ${muted}`}>
                {userProfile.email}
              </p>
            </div>

            <div
              className={`mt-6 rounded-xl p-4 ${
                dark ? "bg-[#30304a]" : "bg-[var(--theme-soft)]"
              }`}
            >
              <p className="text-sm font-bold text-[var(--theme-primary)]">
                Akun Edusmart
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs ${muted}`}>Status akun</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Aktif
                </span>
              </div>

              <p className={`mt-3 text-xs ${muted}`}>
                Selamat datang di platform pembelajaran Edusmart.
              </p>
            </div>
          </div>
        </section>

        <AppFooter dark={dark} />
      </div>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href="https://api.whatsapp.com/send/?phone=6282233315885&text=Halo+Ika,+saya+%5BNama+Kamu%5D,+tertarik+membahas+produk+digital+denganmu&type=phone_number&app_absent=0"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi melalui WhatsApp"
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2.5 rounded-full bg-[#128C4A] px-4 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#075E36] hover:shadow-xl sm:bottom-6 sm:right-6 sm:px-5 sm:py-3.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="25"
          height="25"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M16.04 2C8.31 2 2.02 8.28 2.02 16c0 2.47.65 4.79 1.79 6.8L2 30l7.38-1.94A13.9 13.9 0 0 0 16.04 30C23.76 30 30.05 23.72 30.05 16S23.76 2 16.04 2Zm0 25.5c-2.18 0-4.21-.59-5.96-1.62l-.43-.26-4.38 1.15 1.17-4.27-.28-.44A11.43 11.43 0 1 1 16.04 27.5Z" />
          <path d="M22.3 18.75c-.34-.17-2.01-.99-2.32-1.1-.31-.12-.54-.17-.77.17-.23.34-.88 1.1-1.08 1.33-.2.23-.4.26-.74.09-.34-.17-1.43-.53-2.72-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59h-.66c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.84 0 1.67 1.23 3.29 1.4 3.52.17.23 2.42 3.7 5.86 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.01-.82 2.29-1.62.28-.8.28-1.48.2-1.62-.08-.14-.31-.23-.65-.4Z" />
        </svg>
        WhatsApp
      </a>
    </DashboardLayout>
  );
}
