"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";

import {
  Search,
  ExternalLink,
  Sparkles,
  Wrench,
  RefreshCw,
  LayoutGrid,
  List,
  Palette,
  Image,
  BookOpen,
  PenTool,
  Type,
  Presentation,
  ChartPie,
  Gamepad2,
  Images,
  FileText,
  Puzzle,
  ClipboardList,
  Laptop,
  FilePenLine,
  Brain,
  Globe,
  type LucideIcon,
} from "lucide-react";

type AiTool = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  icon: string | null;
  color_class: string | null;
  bg_class: string | null;
  banner_gradient: string | null;
  has_image: boolean;
  is_new: boolean;
  master_folder: string | null;
  status: "active" | "inactive";
  position: number;
};

const iconMap: Record<string, LucideIcon> = {
  "fa-palette": Palette,
  "fa-image": Image,
  "fa-book-open": BookOpen,
  "fa-pen-nib": PenTool,
  "fa-font": Type,
  "fa-chalkboard-user": Presentation,
  "fa-chart-pie": ChartPie,
  "fa-gamepad": Gamepad2,
  "fa-images": Images,
  "fa-file-lines": FileText,
  "fa-puzzle-piece": Puzzle,
  "fa-clipboard-question": ClipboardList,
  "fa-laptop-code": Laptop,
  "fa-file-pen": FilePenLine,
  "fa-brain": Brain,
  "fa-globe": Globe,
};

const colorMap: Record<string, string> = {
  "text-purple-600": "#9333ea",
  "text-amber-600": "#d97706",
  "text-pink-600": "#db2777",
  "text-emerald-600": "#059669",
  "text-rose-600": "#e11d48",
  "text-blue-600": "#2563eb",
  "text-teal-600": "#0d9488",
  "text-indigo-600": "#4f46e5",
  "text-sky-600": "#0284c7",
  "text-cyan-600": "#0891b2",
  "text-fuchsia-600": "#c026d3",
  "text-orange-600": "#ea580c",
  "text-lime-600": "#65a30d",
  "text-violet-600": "#7c3aed",
};

const backgroundMap: Record<string, string> = {
  "bg-purple-100 text-purple-800": "#f3e8ff",
  "bg-amber-100 text-amber-800": "#fef3c7",
  "bg-pink-100 text-pink-800": "#fce7f3",
  "bg-emerald-100 text-emerald-800": "#d1fae5",
  "bg-rose-100 text-rose-800": "#ffe4e6",
  "bg-blue-100 text-blue-800": "#dbeafe",
  "bg-teal-100 text-teal-800": "#ccfbf1",
  "bg-indigo-100 text-indigo-800": "#e0e7ff",
  "bg-sky-100 text-sky-800": "#e0f2fe",
  "bg-cyan-100 text-cyan-800": "#cffafe",
  "bg-fuchsia-100 text-fuchsia-800": "#fae8ff",
  "bg-orange-100 text-orange-800": "#ffedd5",
  "bg-lime-100 text-lime-800": "#ecfccb",
  "bg-violet-100 text-violet-800": "#ede9fe",
};

export default function AksesToolsPage() {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const supabase = useMemo(() => createClient(), []);

  const loadTools = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("status", "active")
      .order("position", { ascending: true });

    if (error) {
      console.error("Gagal memuat AI Tools:", error);
      setError("Gagal memuat daftar tools. Silakan coba kembali.");
    } else {
      setTools((data ?? []) as AiTool[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const filteredTools = tools.filter((tool) => {
    const keyword = search.toLowerCase();

    return (
      tool.name.toLowerCase().includes(keyword) ||
      (tool.description ?? "").toLowerCase().includes(keyword)
    );
  });

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <div className="min-h-screen p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-7">
          {/* Header */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600">
              <Sparkles size={17} />
              EDUSMART TOOLS CENTER
            </div>

            <h1 className="text-2xl font-bold md:text-3xl">Akses Tools AI</h1>

            <p className="mt-2 text-sm text-gray-500">
              Temukan berbagai tools untuk membantu aktivitas belajar, berkarya,
              dan mengembangkan produk digital.
            </p>
          </div>

          {/* Hero */}
          <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 text-white md:p-8">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-sm text-violet-100">
                <Sparkles size={18} />
                Your AI Productivity Space
              </div>

              <h2 className="text-2xl font-bold md:text-3xl">
                Semua Tools dalam Satu Tempat
              </h2>

              <p className="mt-3 text-sm leading-6 text-violet-100">
                Gunakan koleksi AI Tools Edusmart untuk membantu pekerjaan
                menjadi lebih praktis, kreatif, dan produktif.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm">
                <Wrench size={16} />
                {tools.length} Tools tersedia
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau deskripsi tools..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-violet-400"
              />
            </div>

            <button
              onClick={loadTools}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* View Options */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Menampilkan {filteredTools.length} dari {tools.length} tools
            </p>

            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
              <button
                onClick={() => setView("grid")}
                title="Tampilan Grid"
                aria-label="Tampilan Grid"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  view === "grid"
                    ? "bg-violet-600 text-white"
                    : "text-gray-500 hover:bg-violet-50"
                }`}
              >
                <LayoutGrid size={17} />
                <span>Grid</span>
              </button>

              <button
                onClick={() => setView("list")}
                title="Tampilan List"
                aria-label="Tampilan List"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  view === "list"
                    ? "bg-violet-600 text-white"
                    : "text-gray-500 hover:bg-violet-50"
                }`}
              >
                <List size={17} />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Loading / Error / Empty / Tools */}
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-500">
              Memuat daftar tools...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
              {error}
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Wrench size={26} />
              </div>

              <h3 className="font-semibold text-gray-800">
                Tools Tidak Ditemukan
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Tidak ada tools yang sesuai dengan pencarian.
              </p>
            </div>
          ) : (
            <div
              className={
                view === "grid"
                  ? "grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-3"
              }
            >
              {filteredTools.map((tool) => {
                const ToolIcon = iconMap[tool.icon ?? ""] ?? Sparkles;
                const iconColor = colorMap[tool.color_class ?? ""] ?? "#7c3aed";
                const iconBackground =
                  backgroundMap[tool.bg_class ?? ""] ?? "#ede9fe";

                return (
                  <div
                    key={tool.id}
                    className={
                      view === "grid"
                        ? "flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        : "flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
                    }
                  >
                    {/* Icon */}
                    <div
                      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        view === "grid" ? "mb-4" : ""
                      }`}
                      style={{ backgroundColor: iconBackground }}
                    >
                      <ToolIcon size={27} style={{ color: iconColor }} />

                      {tool.is_new && (
                        <span className="absolute -right-3 -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold text-white">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Informasi Tools */}
                    <div
                      className={
                        view === "grid"
                          ? "flex flex-1 flex-col"
                          : "min-w-0 flex-1"
                      }
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                          AI TOOLS
                        </span>

                        {view === "grid" && (
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-600">
                            Tersedia
                          </span>
                        )}
                      </div>

                      <h3 className="min-h-12 line-clamp-2 text-base font-bold leading-6 text-gray-800">
                        {tool.name}
                      </h3>

                      <p
                        className={`mt-2 line-clamp-3 text-sm leading-6 text-gray-500 ${
                          view === "grid" ? "min-h-[72px]" : ""
                        }`}
                      >
                        {tool.description ||
                          "Gunakan tools ini untuk membantu aktivitas Anda."}
                      </p>
                    </div>

                    {/* Status dan Tombol */}
                    {view === "list" && (
                      <span className="hidden shrink-0 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600 sm:inline-flex">
                        Tersedia
                      </span>
                    )}

                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 ${
                        view === "grid" ? "mt-auto w-full" : "w-full sm:w-36"
                      }`}
                    >
                      Buka Tools
                      <ExternalLink size={16} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
