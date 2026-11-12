"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  ExternalLink,
  Sparkles,
  Wrench,
  RefreshCw,
} from "lucide-react";

type AiTool = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  url: string;
  icon: string | null;
  status: "active" | "inactive";
};

export default function AksesToolsPage() {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function loadTools() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("status", "active")
      .order("position", { ascending: true });

    if (error) {
      setError("Gagal memuat daftar tools. Silakan coba kembali.");
    } else {
      setTools(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTools();
  }, []);

  const categories = [
    "Semua",
    ...Array.from(new Set(tools.map((tool) => tool.category))),
  ];

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      (tool.description ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === "Semua" || tool.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <div className="min-h-screen p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-7">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600">
              <Sparkles size={17} />
              EDUSMART TOOLS CENTER
            </div>

            <h1 className="text-2xl font-bold md:text-3xl">Akses Tools AI</h1>

            <p className="mt-2 text-sm text-gray-500">
              Temukan dan gunakan berbagai tools untuk membantu aktivitas
              belajar, berkarya, dan mengembangkan produk digital.
            </p>
          </div>

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

          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama tools..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-violet-400"
              />
            </div>

            <button
              onClick={loadTools}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === item
                    ? "bg-violet-600 text-white"
                    : "bg-white text-gray-600 hover:bg-violet-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

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

              <h3 className="font-semibold text-gray-800">Belum Ada Tools</h3>

              <p className="mt-2 text-sm text-gray-500">
                {search || category !== "Semua"
                  ? "Tidak ada tools yang sesuai dengan pencarian."
                  : "Tools yang tersedia akan ditampilkan di sini."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
                      {tool.icon || "✨"}
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                      Tersedia
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                      {tool.category}
                    </span>

                    <h3 className="mt-2 text-lg font-bold text-gray-800">
                      {tool.name}
                    </h3>
                  </div>

                  <p className="min-h-12 text-sm leading-6 text-gray-500">
                    {tool.description ||
                      "Gunakan tools ini untuk membantu aktivitas Anda."}
                  </p>

                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Buka Tools
                    <ExternalLink size={16} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
