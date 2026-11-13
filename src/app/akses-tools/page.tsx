"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import type { IconName } from "lucide-react/dynamic";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AppFooter from "@/components/layout/AppFooter";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import {
  Search,
  ExternalLink,
  Sparkles,
  X,
  Wrench,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
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
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
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

function getPlatformLabel(url: string) {
  const value = url.toLowerCase();

  if (value.includes("chatgpt.com") || value.includes("chat.openai.com")) {
    return "CHATGPT";
  }

  if (value.includes("gemini") || value.includes("aistudio.google.com")) {
    return "GEMINI";
  }

  return "WEBAPP";
}

function isValidLucideIcon(name: string): name is IconName {
  return Object.prototype.hasOwnProperty.call(dynamicIconImports, name);
}

export default function AksesToolsPage() {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toolToDelete, setToolToDelete] = useState<AiTool | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    url: "",
    icon: "sparkles",
    is_new: false,
    status: "active" as "active" | "inactive",
  });

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    const checkUserRole = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (mounted) setIsAdmin(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (mounted) {
        setIsAdmin(!profileError && profile?.role === "admin");
      }
    };

    checkUserRole();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const loadTools = useCallback(async () => {
    setLoading(true);
    setError("");

    let query = supabase
      .from("ai_tools")
      .select("*")
      .order("position", { ascending: true });

    if (!isAdmin) {
      query = query.eq("status", "active");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Gagal memuat AI Tools:", error);
      setError("Gagal memuat daftar tools. Silakan coba kembali.");
    } else {
      setTools((data ?? []) as AiTool[]);
    }

    setLoading(false);
  }, [supabase, isAdmin]);

  const handleAddTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAdmin) return;

    const iconName = newTool.icon.trim().toLowerCase();
    if (!isValidLucideIcon(iconName)) {
      toast.warning(
        "Nama icon Lucide tidak ditemukan. Periksa kembali nama icon.",
      );
      return;
    }

    setSaving(true);
    setError("");

    const { error: insertError } = await supabase.from("ai_tools").insert({
      name: newTool.name.trim(),
      description: newTool.description.trim(),
      url: newTool.url.trim(),
      icon: iconName,
      color_class: "text-violet-600",
      bg_class: "bg-violet-100 text-violet-800",
      banner_gradient: null,
      has_image: false,
      is_new: newTool.is_new,
      master_folder: null,
      status: newTool.status,
      position: tools.length + 1,
    });

    if (insertError) {
      console.error("Gagal menambahkan tools:", insertError);
      toast.error("Tools gagal ditambahkan. Periksa kembali data dan koneksi.");
      setSaving(false);
      return;
    }

    setNewTool({
      name: "",
      description: "",
      url: "",
      icon: "sparkles",
      is_new: false,
      status: "active",
    });

    setShowAddModal(false);
    setEditingToolId(null);
    await loadTools();
    toast.success("Tools berhasil ditambahkan.");
    setSaving(false);
  };

  const handleUpdateTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin || !editingToolId) return;

    const iconName = newTool.icon.trim().toLowerCase();
    if (!isValidLucideIcon(iconName)) {
      toast.warning(
        "Nama icon Lucide tidak ditemukan. Periksa kembali nama icon.",
      );
      return;
    }

    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("ai_tools")
      .update({
        name: newTool.name.trim(),
        description: newTool.description.trim(),
        url: newTool.url.trim(),
        icon: iconName,
        is_new: newTool.is_new,
        status: newTool.status,
      })
      .eq("id", editingToolId);

    if (updateError) {
      console.error("Gagal memperbarui tools:", updateError);
      toast.error("Tools gagal diperbarui. Silakan coba lagi.");
      setSaving(false);
      return;
    }

    setShowAddModal(false);
    setEditingToolId(null);
    await loadTools();
    toast.success("Informasi tools berhasil diperbarui.");
    setSaving(false);
  };

  const openEditModal = (tool: AiTool) => {
    setSaving(false);
    setNewTool({
      name: tool.name,
      description: tool.description ?? "",
      url: tool.url,
      icon: tool.icon ?? "sparkles",
      is_new: tool.is_new,
      status: tool.status,
    });
    setEditingToolId(tool.id);
    setShowAddModal(true);
  };

  const handleDeleteTool = async () => {
    if (!isAdmin || !toolToDelete) return;

    const tool = toolToDelete;
    setDeletingId(tool.id);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("ai_tools")
        .delete()
        .eq("id", tool.id);

      if (deleteError) {
        console.error("Gagal menghapus tools:", deleteError);
        toast.error("Tools gagal dihapus. Silakan coba lagi.");
        return;
      }

      await loadTools();
      toast.success(`"${tool.name}" berhasil dihapus.`);
      setToolToDelete(null);
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus tools:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const filteredTools = tools.filter((tool) => {
    const keyword = search.toLowerCase().trim();

    return (
      tool.name.toLowerCase().includes(keyword) ||
      (tool.description ?? "").toLowerCase().includes(keyword) ||
      getPlatformLabel(tool.url).toLowerCase().includes(keyword)
    );
  });

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <div className="min-h-screen p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-7">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600">
                <Sparkles size={17} />
                EDUSMART TOOLS CENTER
              </div>

              <h1 className="text-2xl font-bold md:text-3xl">Akses Tools AI</h1>

              <p className="mt-2 text-sm text-gray-500">
                Temukan berbagai tools untuk membantu aktivitas belajar,
                berkarya, dan mengembangkan produk digital.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setSaving(false);
                  setEditingToolId(null);
                  setNewTool({
                    name: "",
                    description: "",
                    url: "",
                    icon: "sparkles",
                    is_new: false,
                    status: "active",
                  });
                  setShowAddModal(true);
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                <Plus size={18} />
                Tambah Tools
              </button>
            )}
          </div>

          {/* Hero */}
          <div className="rounded-3xl bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-primary)] p-6 text-white md:p-8">
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
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-12 text-sm text-gray-800 outline-none transition focus:border-violet-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Hapus pencarian"
                  title="Hapus pencarian"
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-violet-50 hover:text-violet-600"
                >
                  <X size={17} />
                </button>
              )}
            </div>
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
                const LegacyToolIcon = iconMap[tool.icon ?? ""];
                const iconColor = colorMap[tool.color_class ?? ""] ?? "#7c3aed";
                const iconBackground =
                  backgroundMap[tool.bg_class ?? ""] ?? "#ede9fe";

                const platform = getPlatformLabel(tool.url);

                return (
                  <div
                    key={tool.id}
                    className={
                      view === "grid"
                        ? "group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
                        : "group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-violet-200 hover:shadow-md sm:flex-row sm:items-center"
                    }
                  >
                    {/* Icon, Badge Platform, dan Menu Admin */}
                    <div
                      className={`flex items-center gap-3 ${
                        view === "grid"
                          ? "mb-4 w-full justify-between"
                          : "w-full justify-between sm:w-auto"
                      }`}
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundColor: iconBackground }}
                      >
                        {LegacyToolIcon ? (
                          <LegacyToolIcon
                            size={23}
                            style={{ color: iconColor }}
                          />
                        ) : isValidLucideIcon(
                            (tool.icon || "").toLowerCase(),
                          ) ? (
                          <DynamicIcon
                            name={
                              (
                                tool.icon || "sparkles"
                              ).toLowerCase() as IconName
                            }
                            size={23}
                            color={iconColor}
                          />
                        ) : (
                          <Sparkles size={23} color={iconColor} />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-violet-100 bg-violet-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-violet-600">
                          {platform}
                        </span>

                        {isAdmin && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId((current) =>
                                  current === tool.id ? null : tool.id,
                                )
                              }
                              aria-label={`Opsi ${tool.name}`}
                              aria-haspopup="menu"
                              aria-expanded={openMenuId === tool.id}
                              title="Opsi lainnya"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {openMenuId === tool.id && (
                              <>
                                <button
                                  type="button"
                                  aria-label="Tutup menu"
                                  className="fixed inset-0 z-20 cursor-default"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div
                                  role="menu"
                                  className="absolute right-0 top-10 z-30 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl"
                                >
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      openEditModal(tool);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-violet-50 hover:text-violet-700"
                                  >
                                    <Pencil size={15} />
                                    Update Tools
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setToolToDelete(tool);
                                    }}
                                    disabled={deletingId === tool.id}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                  >
                                    <Trash2 size={15} />
                                    {deletingId === tool.id
                                      ? "Menghapus..."
                                      : "Hapus Tools"}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Informasi Tools */}
                    <div
                      className={
                        view === "grid"
                          ? "flex flex-1 flex-col"
                          : "min-w-0 flex-1"
                      }
                    >
                      <div className="mb-2 flex min-w-0 items-center gap-2">
                        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-800 transition-colors group-hover:text-violet-700">
                          {tool.name}
                        </h3>

                        {tool.is_new && (
                          <span className="shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white shadow-sm">
                            NEW
                          </span>
                        )}

                        {tool.status === "inactive" && isAdmin && (
                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-gray-600">
                            NONAKTIF
                          </span>
                        )}
                      </div>

                      <p className="line-clamp-3 text-xs leading-relaxed text-gray-500">
                        {tool.description ||
                          "Gunakan tools ini untuk membantu aktivitas Anda."}
                      </p>
                    </div>

                    {/* Tombol Akses */}
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--theme-primary)] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:brightness-90 hover:shadow-md ${
                        view === "grid"
                          ? "mt-5 w-full"
                          : "w-full whitespace-nowrap sm:w-40"
                      }`}
                    >
                      <Sparkles size={14} />
                      Buka Tools
                      <ExternalLink size={14} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-8">
          <AppFooter dark={dark} />
        </div>
      </div>

      {/* FORM MODAL TAMBAH / UPDATE TOOLS */}
      <FormModal
        open={showAddModal && isAdmin}
        title={editingToolId ? "Update Tools" : "Tambah Tools Baru"}
        description={
          editingToolId
            ? "Perbarui informasi tools yang dipilih."
            : "Masukkan informasi tools yang ingin ditambahkan."
        }
        submitLabel={editingToolId ? "Simpan Perubahan" : "Simpan Tools"}
        loadingLabel="Menyimpan..."
        isLoading={saving}
        onClose={() => {
          setShowAddModal(false);
          setEditingToolId(null);
          setSaving(false);
        }}
        onSubmit={editingToolId ? handleUpdateTool : handleAddTool}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Nama Tools
          </label>
          <input
            required
            value={newTool.name}
            onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
            placeholder="Contoh: AI Worksheet Generator"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Deskripsi
          </label>
          <textarea
            value={newTool.description}
            onChange={(e) =>
              setNewTool({ ...newTool, description: e.target.value })
            }
            placeholder="Tulis deskripsi singkat tools..."
            rows={2}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-violet-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            URL Tools
          </label>
          <input
            required
            type="url"
            value={newTool.url}
            onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
            placeholder="https://..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Icon Lucide
            </label>

            <a
              href="https://lucide.dev/icons/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800"
            >
              Cari Icon Lucide
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-violet-500">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              {isValidLucideIcon(newTool.icon.trim().toLowerCase()) ? (
                <DynamicIcon
                  name={newTool.icon.trim().toLowerCase() as IconName}
                  size={22}
                />
              ) : (
                <Sparkles size={22} />
              )}
            </div>

            <input
              type="text"
              value={newTool.icon}
              onChange={(e) =>
                setNewTool({
                  ...newTool,
                  icon: e.target.value
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "-"),
                })
              }
              placeholder="Contoh: wand-sparkles"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-gray-800 outline-none"
            />
          </div>

          <p className="mt-1.5 text-xs text-gray-400">
            Salin nama icon dari Lucide, lalu tempelkan di sini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={newTool.is_new}
              onChange={(e) =>
                setNewTool({ ...newTool, is_new: e.target.checked })
              }
              className="h-4 w-4 accent-violet-600"
            />
            Tandai sebagai NEW
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            Status:
            <select
              value={newTool.status}
              onChange={(e) =>
                setNewTool({
                  ...newTool,
                  status: e.target.value as "active" | "inactive",
                })
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 pb-10 text-sm"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </label>
        </div>
      </FormModal>

      {/* DIALOG KONFIRMASI HAPUS TOOLS */}
      <ConfirmDialog
        open={Boolean(toolToDelete)}
        title="Hapus Tools Ini?"
        description="Tools ini akan dihapus dari katalog Akses Tools dan tidak lagi terlihat oleh pengguna."
        itemName={toolToDelete?.name}
        confirmLabel="Ya, Hapus Tools"
        loadingLabel="Menghapus..."
        isLoading={Boolean(toolToDelete && deletingId === toolToDelete.id)}
        onCancel={() => {
          if (!deletingId) setToolToDelete(null);
        }}
        onConfirm={handleDeleteTool}
      />
    </DashboardLayout>
  );
}
