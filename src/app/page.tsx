"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  GraduationCap,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Clock3,
  ArrowRight,
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
    color: "bg-violet-100 text-violet-600",
    icon: Sparkles,
  },
  {
    title: "AI Tools Creator",
    subtitle: "Belajar membangun AI Tools",
    lessons: 14,
    progress: 35,
    color: "bg-blue-100 text-blue-600",
    icon: Wrench,
  },
  {
    title: "Website Builder",
    subtitle: "Membangun website profesional",
    lessons: 12,
    progress: 0,
    color: "bg-emerald-100 text-emerald-600",
    icon: ChartNoAxesCombined,
  },
];

export default function DashboardPage() {
  const [dark, setDark] = useState(false);

  const card = dark
    ? "bg-[#202033] border-[#33334b]"
    : "bg-white border-[#ececf3]";

  const muted = dark ? "text-gray-400" : "text-gray-500";

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <div className="mx-auto w-full max-w-363 space-y-6 p-4 sm:p-6 lg:space-y-7 lg:p-9">
        {/* WELCOME BANNER */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-violet-700 via-violet-600 to-indigo-500 p-7 text-white md:p-10">
          <div className="relative z-10 max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold backdrop-blur">
              <Sparkles size={13} />
              DIGITAL LEARNING PLATFORM
            </div>

            <h2 className="text-2xl font-bold leading-tight md:text-4xl">
              Selamat Datang di Edusmart!
            </h2>

            <p className="mt-3 max-w-md text-xs leading-relaxed text-violet-100 md:text-sm">
              Tempat belajar, mengembangkan kreativitas, dan membangun masa
              depan sebagai digital creator.
            </p>

            <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-violet-700 transition hover:bg-violet-50">
              Mulai Belajar <ArrowRight size={15} />
            </button>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="pointer-events-none absolute right-12 top-10 hidden text-white/20 md:block">
            <GraduationCap size={145} />
          </div>
        </section>

        {/* STATISTICS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Kelas",
              value: "08",
              icon: BookOpen,
              color: "bg-violet-100 text-violet-600",
            },
            {
              label: "Video Pembelajaran",
              value: "42",
              icon: PlayCircle,
              color: "bg-blue-100 text-blue-600",
            },
            {
              label: "Materi Selesai",
              value: "12",
              icon: CheckCircle2,
              color: "bg-emerald-100 text-emerald-600",
            },
            {
              label: "Jam Belajar",
              value: "18 Jam",
              icon: Clock3,
              color: "bg-orange-100 text-orange-600",
            },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-5 ${card}`}>
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon size={20} />
              </div>

              <p className={`text-xs ${muted}`}>{stat.label}</p>
              <h3 className="mt-1 text-2xl font-bold">{stat.value}</h3>
            </div>
          ))}
        </section>

        {/* COURSES */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Lanjutkan Pembelajaran</h3>

              <p className={`mt-1 text-xs ${muted}`}>
                Lanjutkan kelas yang sedang kamu pelajari.
              </p>
            </div>

            <button className="flex items-center gap-1 text-xs font-semibold text-violet-600">
              Lihat Semua <ArrowRight size={14} />
            </button>
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
                  <p className="text-sm font-bold">{course.title}</p>

                  <p className={`mt-1 text-[11px] ${muted}`}>
                    {course.subtitle}
                  </p>

                  <div
                    className={`mt-4 flex justify-between text-[11px] ${muted}`}
                  >
                    <span>{course.lessons} Materi</span>
                    <span className="font-bold text-violet-600">
                      {course.progress}%
                    </span>
                  </div>

                  <div
                    className={`mt-2 h-1.5 overflow-hidden rounded-full ${
                      dark ? "bg-[#3a3a52]" : "bg-gray-100"
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <button
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition ${
                      dark
                        ? "bg-[#30304a] text-white hover:bg-violet-600"
                        : "bg-violet-50 text-violet-700 hover:bg-violet-600 hover:text-white"
                    }`}
                  >
                    {course.progress === 0
                      ? "Mulai Belajar"
                      : "Lanjutkan Belajar"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CONTENT */}
        <section className="grid gap-5 xl:grid-cols-3">
          <div className={`rounded-2xl border p-6 xl:col-span-2 ${card}`}>
            <h3 className="font-bold">Aktivitas Pembelajaran</h3>

            <p className={`mt-1 text-xs ${muted}`}>
              Ringkasan aktivitas belajar kamu.
            </p>

            <div className="mt-6 space-y-5">
              {[
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
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <item.icon size={19} />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-semibold">{item.title}</p>
                    <p className={`mt-1 text-[10px] ${muted}`}>{item.time}</p>
                  </div>

                  <ChevronRight size={16} className={muted} />
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border p-6 ${card}`}>
            <div className="flex items-center gap-2">
              <Users size={19} className="text-violet-600" />
              <h3 className="font-bold">Profil Belajar</h3>
            </div>

            <div className="mt-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-2xl font-bold text-violet-700">
                I
              </div>

              <h4 className="mt-3 text-sm font-bold">Ikanuraisma</h4>
              <p className={`mt-1 text-[11px] ${muted}`}>Administrator</p>
            </div>

            <div
              className={`mt-6 rounded-xl p-4 ${
                dark ? "bg-[#30304a]" : "bg-violet-50"
              }`}
            >
              <p className="text-xs font-bold text-violet-600">
                Learning Progress
              </p>

              <p className="mt-2 text-2xl font-bold">75%</p>

              <div
                className={`mt-3 h-2 overflow-hidden rounded-full ${
                  dark ? "bg-[#45455e]" : "bg-white"
                }`}
              >
                <div className="h-full w-3/4 rounded-full bg-violet-600" />
              </div>

              <p className={`mt-2 text-[10px] ${muted}`}>
                Terus semangat belajar!
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className={`border-t pt-5 text-center text-[10px] ${
            dark ? "border-[#33334b]" : "border-gray-200"
          } ${muted}`}
        >
          © 2026 Edusmart by Ikanuraisma. All rights reserved.
        </footer>
      </div>
    </DashboardLayout>
  );
}
