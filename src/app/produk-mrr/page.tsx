"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AppFooter from "@/components/layout/AppFooter";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  Copy,
  ExternalLink,
  LayoutGrid,
  List,
  Package,
  Filter,
  RefreshCw,
} from "lucide-react";

type Category = {
  category_id: string;
  name: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  status: string;
};

type Product = {
  product_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  icon: string | null;
  product_link: string | null;
  link_type: string | null;
  cover_url: string | null;
  sort_order: number;
  status: string;
  created_at?: string;
};

type ProductForm = {
  name: string;
  category_id: string;
  description: string;
  icon: string;
  product_link: string;
  link_type: string;
  cover_url: string;
  status: string;
};

const emptyForm: ProductForm = {
  name: "",
  category_id: "",
  description: "",
  icon: "📦",
  product_link: "",
  link_type: "Eksternal",
  cover_url: "",
  status: "Aktif",
};

export default function ProdukMRRPage() {
  const [dark, setDark] = useState(false);
  const [supabase] = useState(() => createClient());

  const [role, setRole] = useState<"admin" | "member" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [driveFileTotal, setDriveFileTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("default");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const isAdmin = role === "admin";

  const loadData = useCallback(async () => {
    setLoading(true);

    const [categoryResult, productResult, driveStatsResult] = await Promise.all(
      [
        supabase
          .from("product_categories")
          .select("*")
          .order("sort_order", { ascending: true }),

        supabase
          .from("products")
          .select("*")
          .order("sort_order", { ascending: true }),

        supabase
          .from("product_drive_stats")
          .select("total_files")
          .eq("id", 1)
          .maybeSingle(),
      ],
    );

    if (categoryResult.error) {
      console.error(categoryResult.error);
      toast.error("Gagal memuat kategori produk.");
    } else {
      setCategories(categoryResult.data ?? []);
    }

    if (productResult.error) {
      console.error(productResult.error);
      toast.error("Gagal memuat produk.");
    } else {
      setProducts(productResult.data ?? []);
    }

    if (driveStatsResult.error) {
      console.error(driveStatsResult.error);
      toast.error("Gagal memuat statistik file Google Drive.");
    } else {
      setDriveFileTotal(Number(driveStatsResult.data?.total_files ?? 0));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        toast.error("Silakan login kembali.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!active) return;

      if (profileError) {
        console.error(profileError);
        toast.error("Gagal memeriksa hak akses akun.");
        setLoading(false);
        return;
      }

      setRole(profile.role === "admin" ? "admin" : "member");
      await loadData();
    }

    initialize();

    return () => {
      active = false;
    };
  }, [supabase, loadData]);

  const activeProducts = products.filter(
    (product) => product.status === "Aktif",
  );

  // Administrator dapat melihat semua produk; member hanya produk aktif.
  const visibleProducts = isAdmin ? products : activeProducts;

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    const result = visibleProducts.filter((product) => {
      const category = categories.find(
        (item) => item.category_id === product.category_id,
      );

      const matchSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        (product.description ?? "").toLowerCase().includes(keyword) ||
        (category?.name ?? "").toLowerCase().includes(keyword);

      const matchCategory =
        selectedCategory === "all" || product.category_id === selectedCategory;

      return matchSearch && matchCategory;
    });

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name, "id");

        case "name-desc":
          return b.name.localeCompare(a.name, "id");

        case "newest":
          return (
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
          );

        case "oldest":
          return (
            new Date(a.created_at ?? 0).getTime() -
            new Date(b.created_at ?? 0).getTime()
          );

        default:
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      }
    });
  }, [visibleProducts, categories, search, selectedCategory, sortBy]);

  // Link non-Google Drive dihitung satu item per produk.
  // File dan folder Google Drive sudah dihitung oleh Apps Script.
  const nonDriveLinkCount = products.filter((product) => {
    const link = product.product_link?.trim();
    return Boolean(link) && !link.includes("drive.google.com");
  }).length;

  const totalProductResources = driveFileTotal + nonDriveLinkCount;

  function getCategoryName(categoryId: string | null) {
    return (
      categories.find((item) => item.category_id === categoryId)?.name ??
      "Tanpa Kategori"
    );
  }

  function openAddModal() {
    setEditingProduct(null);
    setForm({
      ...emptyForm,
      category_id: categories[0]?.category_id ?? "",
    });
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);

    setForm({
      name: product.name,
      category_id: product.category_id ?? "",
      description: product.description ?? "",
      icon: product.icon ?? "📦",
      product_link: product.product_link ?? "",
      link_type: product.link_type ?? "Eksternal",
      cover_url: product.cover_url ?? "",
      status: product.status ?? "Aktif",
    });

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
  }

  function generateProductId() {
    const highestNumber = products.reduce((highest, product) => {
      const number = Number(product.product_id.replace("PRD", ""));
      return Number.isFinite(number) ? Math.max(highest, number) : highest;
    }, 0);

    return `PRD${String(highestNumber + 1).padStart(4, "0")}`;
  }

  async function handleSave(e: { preventDefault: () => void }) {
    e.preventDefault();

    if (!isAdmin) {
      toast.error("Kamu tidak memiliki akses untuk mengubah produk.");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Nama produk wajib diisi.");
      return;
    }

    if (!form.category_id) {
      toast.error("Silakan pilih kategori produk.");
      return;
    }

    setSaving(true);

    const payload = {
      category_id: form.category_id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      icon: form.icon.trim() || null,
      product_link: form.product_link.trim() || null,
      link_type: form.link_type,
      cover_url: form.cover_url.trim() || null,
      status: form.status,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (editingProduct) {
      const result = await supabase
        .from("products")
        .update(payload)
        .eq("product_id", editingProduct.product_id);

      error = result.error;
    } else {
      const result = await supabase.from("products").insert({
        ...payload,
        product_id: generateProductId(),
        sort_order: products.length + 1,
      });

      error = result.error;
    }

    setSaving(false);

    if (error) {
      console.error(error);
      toast.error("Produk gagal disimpan: " + error.message);
      return;
    }

    toast.success(
      editingProduct
        ? "Produk berhasil diperbarui."
        : "Produk berhasil ditambahkan.",
    );

    closeModal();
    await loadData();
  }

  function requestDelete(product: Product) {
    if (!isAdmin) return;
    setOpenMenuId(null);
    setDeleteTarget(product);
  }

  async function confirmDelete() {
    if (!isAdmin || !deleteTarget) return;

    setDeleting(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("product_id", deleteTarget.product_id);

    setDeleting(false);

    if (error) {
      console.error(error);
      toast.error("Produk gagal dihapus: " + error.message);
      return;
    }

    toast.success("Produk berhasil dihapus.");
    setDeleteTarget(null);
    await loadData();
  }

  async function toggleProductStatus(product: Product) {
    if (!isAdmin) return;

    const newStatus = product.status === "Aktif" ? "Nonaktif" : "Aktif";

    const { error } = await supabase
      .from("products")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("product_id", product.product_id);

    if (error) {
      toast.error("Status produk gagal diperbarui.");
      return;
    }

    toast.success(`Produk sekarang ${newStatus.toLowerCase()}.`);
    await loadData();
  }

  async function copyProductLink(link: string | null) {
    if (!link) {
      toast.error("Produk belum memiliki link.");
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link produk berhasil disalin.");
    } catch {
      toast.error("Gagal menyalin link. Silakan salin secara manual.");
    }
  }

  function openProduct(link: string | null) {
    if (!link) {
      toast.error("Link produk belum tersedia.");
      return;
    }

    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <main className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {/* HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600">
                <Package size={17} />
                EDUSMART PRODUCT LIBRARY
              </div>

              <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
                Produk MRR
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Temukan dan kelola koleksi produk digital Edusmart dalam satu
                tempat.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Plus size={18} />
                Tambah Produk
              </button>
            )}
          </div>

          {/* STATISTIK */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Produk</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {totalProductResources.toLocaleString("id-ID")}
                  </h2>
                </div>
                <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
                  <Package size={23} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Kategori</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {categories.length}
                  </h2>
                </div>
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <LayoutGrid size={23} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Produk Aktif</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {activeProducts.length}
                  </h2>
                </div>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <Package size={23} />
                </div>
              </div>
            </div>
          </div>

          {/* AREA KATALOG */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
            {/* PENCARIAN DAN TOMBOL */}
            <div className="mb-5 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama produk atau deskripsi..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Hapus pencarian"
                    title="Hapus pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 outline-none focus:border-violet-400"
                >
                  <option value="default">Urutan Default</option>
                  <option value="name-asc">Nama A–Z</option>
                  <option value="name-desc">Nama Z–A</option>
                  <option value="newest">Terbaru Ditambahkan</option>
                  <option value="oldest">Terlama Ditambahkan</option>
                </select>

                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    title="Tampilan Grid"
                    className={`rounded-lg p-2 ${
                      viewMode === "grid"
                        ? "bg-violet-600 text-white shadow"
                        : "text-slate-500"
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>

                  <button
                    onClick={() => setViewMode("list")}
                    title="Tampilan List"
                    className={`rounded-lg p-2 ${
                      viewMode === "list"
                        ? "bg-violet-600 text-white shadow"
                        : "text-slate-500"
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* FILTER KATEGORI */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="product-category-filter"
                className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-600"
              >
                <Filter size={16} />
                Filter Kategori
              </label>

              <select
                id="product-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:max-w-xs"
              >
                <option value="all">
                  Semua Produk ({visibleProducts.length})
                </option>
                {categories
                  .filter((category) => category.status === "Aktif")
                  .map((category) => {
                    const categoryCount = visibleProducts.filter(
                      (product) => product.category_id === category.category_id,
                    ).length;

                    return (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.icon ? `${category.icon} ` : ""}
                        {category.name} ({categoryCount})
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* JUDUL HASIL */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-bold text-slate-800">
                  {selectedCategory === "all"
                    ? "Semua Produk"
                    : getCategoryName(selectedCategory)}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Menampilkan {filteredProducts.length} produk
                </p>
              </div>

              {isAdmin && (
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
                  Mode Administrator
                </span>
              )}
            </div>

            {/* LOADING */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <RefreshCw size={28} className="mb-3 animate-spin" />
                <p className="text-sm">Memuat katalog produk...</p>
              </div>
            )}

            {/* KOSONG */}
            {!loading && filteredProducts.length === 0 && (
              <div className="py-20 text-center">
                <Package size={42} className="mx-auto mb-3 text-slate-300" />
                <h3 className="font-semibold text-slate-700">
                  Produk tidak ditemukan
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Coba gunakan kata kunci atau kategori lain.
                </p>
              </div>
            )}

            {/* GRID */}
            {!loading && filteredProducts.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <article
                    key={product.product_id}
                    className={`group relative overflow-visible rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg ${openMenuId === product.product_id ? "z-50" : "z-0"}`}
                  >
                    {/* COVER */}
                    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--theme-soft)] to-[var(--theme-selection)]">
                      {product.cover_url ? (
                        <>
                          <img
                            src={product.cover_url}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              const fallback = event.currentTarget
                                .nextElementSibling as HTMLElement | null;
                              if (fallback) fallback.style.display = "flex";
                            }}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div
                            style={{ display: "none" }}
                            className="h-full w-full items-center justify-center"
                          >
                            <span className="select-none text-7xl drop-shadow-sm">
                              {product.icon || "📦"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="select-none text-7xl drop-shadow-sm">
                            {product.icon || "📦"}
                          </span>
                        </div>
                      )}

                      <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold ${
                          product.status === "Aktif"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    {/* INFORMASI */}
                    <div className="space-y-3 p-4">
                      <div>
                        <p className="mb-1 text-xs font-medium text-violet-600">
                          {getCategoryName(product.category_id)}
                        </p>

                        <h3 className="line-clamp-2 min-h-12 font-bold text-slate-800">
                          {product.name}
                        </h3>

                        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                          {product.description || "Belum ada deskripsi produk."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                        <button
                          onClick={() => openProduct(product.product_link)}
                          disabled={!product.product_link}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ExternalLink size={15} />
                          Buka Produk
                        </button>

                        <button
                          onClick={() => copyProductLink(product.product_link)}
                          disabled={!product.product_link}
                          title="Salin link"
                          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-40"
                        >
                          <Copy size={16} />
                        </button>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <button
                            onClick={() => toggleProductStatus(product)}
                            className="text-xs font-medium text-slate-500 hover:text-violet-600"
                          >
                            Pengaturan
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === product.product_id
                                    ? null
                                    : product.product_id,
                                )
                              }
                              aria-label="Opsi produk"
                              title="Opsi lainnya"
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                            >
                              <MoreVertical size={17} />
                            </button>
                            {openMenuId === product.product_id && (
                              <>
                                <div className="absolute bottom-14 right-3 z-[80] w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      openEditModal(product);
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                                  >
                                    <Pencil size={16} />
                                    Edit Produk
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => requestDelete(product)}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                                  >
                                    <Trash2 size={16} />
                                    Hapus Produk
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* LIST */}
            {!loading && filteredProducts.length > 0 && viewMode === "list" && (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <article
                    key={product.product_id}
                    className={`relative flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/20 sm:flex-row sm:items-center ${openMenuId === product.product_id ? "z-50" : "z-0"}`}
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-50">
                      {product.cover_url ? (
                        <>
                          <img
                            src={product.cover_url}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              const fallback = event.currentTarget
                                .nextElementSibling as HTMLElement | null;
                              if (fallback) fallback.style.display = "flex";
                            }}
                            className="h-full w-full object-cover"
                          />
                          <span
                            style={{ display: "none" }}
                            className="h-full w-full items-center justify-center text-3xl"
                          >
                            {product.icon || "📦"}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl">{product.icon || "📦"}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-violet-600">
                        {getCategoryName(product.category_id)}
                      </p>

                      <h3 className="mt-1 font-bold text-slate-800">
                        {product.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {product.description || "Belum ada deskripsi produk."}
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          product.status === "Aktif"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openProduct(product.product_link)}
                        disabled={!product.product_link}
                        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
                      >
                        <ExternalLink size={15} />
                        Buka
                      </button>

                      <button
                        onClick={() => copyProductLink(product.product_link)}
                        disabled={!product.product_link}
                        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-violet-50 disabled:opacity-40"
                      >
                        <Copy size={16} />
                      </button>

                      {isAdmin && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === product.product_id
                                  ? null
                                  : product.product_id,
                              )
                            }
                            aria-label="Opsi produk"
                            title="Opsi lainnya"
                            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
                          >
                            <MoreVertical size={17} />
                          </button>
                          {openMenuId === product.product_id && (
                            <>
                              <div className="absolute bottom-14 right-3 z-[80] w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    openEditModal(product);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                                >
                                  <Pencil size={16} />
                                  Edit Produk
                                </button>
                                <button
                                  type="button"
                                  onClick={() => requestDelete(product)}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                  Hapus Produk
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <AppFooter dark={dark} />
        </div>
      </main>

      {/* MODAL TAMBAH / EDIT */}
      <FormModal
        open={modalOpen && isAdmin}
        title={editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
        description="Lengkapi informasi produk di bawah ini."
        submitLabel={editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
        loadingLabel="Menyimpan..."
        isLoading={saving}
        onClose={closeModal}
        onSubmit={handleSave}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nama Produk *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Worksheet Alphabet"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Kategori *
            </label>
            <select
              required
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Ikon Produk
            </label>
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="📦"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Deskripsi
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Tuliskan deskripsi singkat produk..."
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Link Produk
            </label>
            <input
              type="url"
              value={form.product_link}
              onChange={(e) =>
                setForm({ ...form, product_link: e.target.value })
              }
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Jenis Link
            </label>
            <select
              value={form.link_type}
              onChange={(e) => setForm({ ...form, link_type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
            >
              <option value="Eksternal">Eksternal</option>
              <option value="Internal">Internal</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Link Cover Produk
            </label>
            <input
              type="url"
              value={form.cover_url}
              onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
            <p className="mt-1 text-xs text-slate-400">
              Masukkan URL gambar cover yang dapat diakses publik.
            </p>
          </div>
        </div>
      </FormModal>

      {/* KONFIRMASI HAPUS */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Produk Ini?"
        description="Produk ini akan dihapus dari katalog Produk MRR."
        itemName={deleteTarget?.name}
        confirmLabel="Ya, Hapus Produk"
        loadingLabel="Menghapus..."
        isLoading={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
}
