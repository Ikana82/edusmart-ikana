"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  BookOpen,
  GraduationCap,
  Code2,
  Palette,
  ArrowRight,
  Clock3,
  X,
  Sparkles,
  Layers3,
  Plus,
  Settings2,
  Pencil,
  Trash2,
  Check,
  ChevronDown,
  Globe,
  Store,
  Lightbulb,
  Heart,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

type Category = {
  id: number;
  name: string;
  icon: string;
  color: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  gradientStart: string;
  gradientEnd: string;
};

type Course = {
  id: number;
  title: string;
  category: string;
  description: string;
  lessons: string;
  duration: string;
  details: string;
  topics: string[];
};

const iconOptions: { name: string; icon: LucideIcon }[] = [
  { name: "BookOpen", icon: BookOpen },
  { name: "Sparkles", icon: Sparkles },
  { name: "Code2", icon: Code2 },
  { name: "Palette", icon: Palette },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Globe", icon: Globe },
  { name: "Store", icon: Store },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Heart", icon: Heart },
];

const initialCategories: Category[] = [
  {
    id: 1,
    name: "AI Tools",
    icon: "Sparkles",
    color: "#7C3AED",
    iconBg: "#F3E8FF",
    iconColor: "#7C3AED",
    badgeBg: "#EDE9FE",
    badgeText: "#6D28D9",
    gradientStart: "#7C3AED",
    gradientEnd: "#4F46E5",
  },
  {
    id: 2,
    name: "Website",
    icon: "Code2",
    color: "#2563EB",
    iconBg: "#DBEAFE",
    iconColor: "#2563EB",
    badgeBg: "#DBEAFE",
    badgeText: "#1D4ED8",
    gradientStart: "#2563EB",
    gradientEnd: "#0891B2",
  },
  {
    id: 3,
    name: "Canva",
    icon: "Palette",
    color: "#DB2777",
    iconBg: "#FCE7F3",
    iconColor: "#DB2777",
    badgeBg: "#FCE7F3",
    badgeText: "#BE185D",
    gradientStart: "#EC4899",
    gradientEnd: "#9333EA",
  },
];

const initialCourses: Course[] = [
  {
    id: 1,
    title: "AI Tools Creator",
    category: "AI Tools",
    description:
      "Belajar merancang konsep, menyusun prompt, dan membangun AI Tools sendiri.",
    lessons: "14 Materi",
    duration: "Program Pembelajaran",
    details:
      "Pelajari proses pembuatan AI Tools mulai dari menentukan ide, merancang instruksi AI, menyusun workflow, membuat prototype, hingga melakukan pengujian.",
    topics: [
      "Menentukan Ide AI Tools",
      "Menyusun Master Prompt",
      "Merancang Workflow",
      "Membangun Prototype",
      "Testing dan Evaluasi",
    ],
  },
  {
    id: 2,
    title: "GAS Builder Website",
    category: "Website",
    description: "Belajar membuat website menggunakan Google Apps Script.",
    lessons: "Materi akan diisi",
    duration: "Program Pembelajaran",
    details:
      "Program pembelajaran untuk mengenal proses membangun website dengan Google Apps Script.",
    topics: [
      "Pengenalan Google Apps Script",
      "Struktur Project Website",
      "Membangun Tampilan Website",
      "Integrasi Google Spreadsheet",
      "Deployment Website",
    ],
  },
  {
    id: 3,
    title: "Worksheet Builder with Canva",
    category: "Canva",
    description: "Belajar merancang worksheet edukasi anak menggunakan Canva.",
    lessons: "Materi akan diisi",
    duration: "Program Pembelajaran",
    details:
      "Program pembelajaran untuk membuat worksheet anak dengan perencanaan aktivitas dan desain visual menggunakan Canva.",
    topics: [
      "Menentukan Ide Worksheet",
      "Menyusun Aktivitas Pembelajaran",
      "Membuat Desain di Canva",
      "Mempersiapkan File Cetak",
      "Mengembangkan Produk Digital",
    ],
  },
];

const palettes = [
  ["#7C3AED", "#4F46E5", "#A855F7", "#C084FC", "#E879F9"],
  ["#2563EB", "#0891B2", "#06B6D4", "#38BDF8", "#93C5FD"],
  ["#DB2777", "#E11D48", "#F472B6", "#FB7185", "#FDA4AF"],
  ["#059669", "#0D9488", "#14B8A6", "#34D399", "#6EE7B7"],
  ["#D97706", "#EA580C", "#F59E0B", "#FBBF24", "#FCD34D"],
  ["#475569", "#64748B", "#78716C", "#A1A1AA", "#9CA3AF"],
];

const defaultCategory: Category = {
  id: 0,
  name: "",
  icon: "BookOpen",
  color: "#7C3AED",
  iconBg: "#F3E8FF",
  iconColor: "#7C3AED",
  badgeBg: "#EDE9FE",
  badgeText: "#6D28D9",
  gradientStart: "#7C3AED",
  gradientEnd: "#4F46E5",
};

function getIcon(name: string): LucideIcon {
  return iconOptions.find((item) => item.name === name)?.icon || BookOpen;
}

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function ColorField({ label, value, onChange }: ColorFieldProps) {
  const validColor = /^#[0-9A-Fa-f]{6}$/.test(value);

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-gray-600">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={validColor ? value : "#7C3AED"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-11 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
          aria-label={`Pilih ${label}`}
        />

        <input
          type="text"
          value={value}
          maxLength={7}
          onChange={(event) => {
            const nextValue = event.target.value.toUpperCase();
            onChange(nextValue.startsWith("#") ? nextValue : `#${nextValue}`);
          }}
          placeholder="#7C3AED"
          className={`min-w-0 flex-1 rounded-lg border px-3 py-3 text-sm uppercase outline-none focus:border-violet-500 ${
            validColor ? "border-gray-200" : "border-red-300"
          }`}
        />
      </div>

      {!validColor && (
        <p className="mt-1 text-[10px] text-red-500">
          Masukkan kode HEX yang valid, contoh #7C3AED.
        </p>
      )}
    </div>
  );
}

export default function LMSEcoursePage() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkUserRole() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (active) {
          setIsAdmin(false);
          setRoleLoading(false);
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (active) {
        setIsAdmin(!error && profile?.role === "admin");
        setRoleLoading(false);
      }
    }

    checkUserRole();

    return () => {
      active = false;
    };
  }, []);

  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua Kelas");

  const [categoriesList, setCategoriesList] =
    useState<Category[]>(initialCategories);

  const [courseList, setCourseList] = useState<Course[]>(initialCourses);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );

  const [categoryForm, setCategoryForm] = useState<Category>(defaultCategory);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [categoryTab, setCategoryTab] = useState<"main" | "details">("main");

  const filteredCourses = courseList.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "Semua Kelas" || course.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const updateCategoryField = (field: keyof Category, value: string) => {
    setCategoryForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openNewCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      ...defaultCategory,
      id: Date.now(),
    });
    setCategoryTab("main");
    setShowCategoryManager(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({ ...category });
    setCategoryTab("main");
    setShowCategoryManager(true);
  };

  const saveCategory = () => {
    if (!categoryForm.name.trim()) {
      alert("Nama kategori wajib diisi.");
      return;
    }

    const colorFields = [
      categoryForm.color,
      categoryForm.iconBg,
      categoryForm.iconColor,
      categoryForm.badgeBg,
      categoryForm.badgeText,
      categoryForm.gradientStart,
      categoryForm.gradientEnd,
    ];

    if (colorFields.some((color) => !/^#[0-9A-Fa-f]{6}$/.test(color))) {
      alert("Periksa kembali kode HEX. Semua warna harus valid.");
      return;
    }

    const duplicate = categoriesList.some(
      (category) =>
        category.name.toLowerCase() ===
          categoryForm.name.trim().toLowerCase() &&
        category.id !== editingCategoryId,
    );

    if (duplicate) {
      alert("Nama kategori tersebut sudah digunakan.");
      return;
    }

    const savedCategory = {
      ...categoryForm,
      name: categoryForm.name.trim(),
    };

    if (editingCategoryId !== null) {
      const oldCategory = categoriesList.find(
        (category) => category.id === editingCategoryId,
      );

      setCategoriesList((previous) =>
        previous.map((category) =>
          category.id === editingCategoryId ? savedCategory : category,
        ),
      );

      if (oldCategory && oldCategory.name !== savedCategory.name) {
        setCourseList((previous) =>
          previous.map((course) =>
            course.category === oldCategory.name
              ? { ...course, category: savedCategory.name }
              : course,
          ),
        );

        if (activeCategory === oldCategory.name) {
          setActiveCategory(savedCategory.name);
        }
      }
    } else {
      setCategoriesList((previous) => [...previous, savedCategory]);
    }

    setShowCategoryManager(false);
  };

  const deleteCategory = (category: Category) => {
    const hasCourses = courseList.some(
      (course) => course.category === category.name,
    );

    if (hasCourses) {
      alert(
        "Kategori ini masih digunakan oleh kelas. Pindahkan kelas ke kategori lain terlebih dahulu.",
      );
      return;
    }

    if (!confirm(`Hapus kategori "${category.name}"?`)) return;

    setCategoriesList((previous) =>
      previous.filter((item) => item.id !== category.id),
    );

    if (activeCategory === category.name) {
      setActiveCategory("Semua Kelas");
    }
  };

  const handleAddCourse = () => {
    if (!newTitle.trim() || !newCategory.trim()) {
      alert("Nama kelas dan kategori wajib diisi.");
      return;
    }

    const categoryExists = categoriesList.some(
      (category) =>
        category.name.toLowerCase() === newCategory.trim().toLowerCase(),
    );

    if (!categoryExists) {
      alert(
        "Pilih kategori yang sudah tersedia. Tambahkan kategori terlebih dahulu melalui Kelola Kategori.",
      );
      return;
    }

    const newCourse: Course = {
      id: Date.now(),
      title: newTitle.trim(),
      category: newCategory.trim(),
      description: newDescription.trim(),
      lessons: "Belum ada materi",
      duration: "Program Pembelajaran",
      details: newDescription.trim(),
      topics: [],
    };

    setCourseList((previous) => [...previous, newCourse]);
    setNewTitle("");
    setNewCategory("");
    setNewDescription("");
    setShowAddCourse(false);
  };

  const totalPrograms = courseList.length;
  const totalCategories = categoriesList.length;

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <div className="mx-auto w-full max-w-[1450px] space-y-8 p-4 sm:p-6 lg:p-9">
        <section>
          <div className="mb-2 flex items-center gap-2 text-violet-600">
            <GraduationCap size={22} />
            <span className="text-sm font-semibold">
              Learning Management System
            </span>
          </div>

          <h1 className="text-2xl font-bold md:text-3xl">LMS - Ecourse</h1>

          <p className="mt-2 text-sm text-gray-500">
            Temukan kelas, pelajari materi, dan tingkatkan kemampuanmu.
          </p>
        </section>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-500 p-7 text-white md:p-10">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
              <Sparkles size={14} />
              YOUR LEARNING JOURNEY
            </span>

            <h2 className="mt-5 text-2xl font-bold leading-tight md:text-4xl">
              Kembangkan Potensimu Bersama Edusmart
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-violet-100">
              Pelajari keterampilan baru, bangun kreativitas, dan kembangkan
              kemampuanmu sebagai digital creator.
            </p>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <GraduationCap
            size={150}
            className="pointer-events-none absolute right-12 top-10 hidden text-white/20 md:block"
          />
        </section>

        {/* SUMMARY */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div
            className={`flex items-center gap-4 rounded-2xl border p-5 ${
              dark
                ? "border-[#33334b] bg-[#202033]"
                : "border-[#ececf3] bg-white"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <BookOpen size={23} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Program</p>
              <h3 className="text-2xl font-bold">{totalPrograms}</h3>
            </div>
          </div>

          <div
            className={`flex items-center gap-4 rounded-2xl border p-5 ${
              dark
                ? "border-[#33334b] bg-[#202033]"
                : "border-[#ececf3] bg-white"
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Layers3 size={23} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Kategori Pembelajaran</p>
              <h3 className="text-2xl font-bold">{totalCategories}</h3>
            </div>
          </div>
        </section>

        {/* CATALOG */}
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Katalog Pembelajaran</h2>
              <p className="mt-1 text-sm text-gray-500">
                Pilih program yang ingin kamu pelajari.
              </p>
            </div>

            {!roleLoading && isAdmin && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowCategoryManager(true)}
                  className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
                >
                  <Settings2 size={16} />
                  Kelola Kategori
                </button>

                <button
                  onClick={() => setShowAddCourse(true)}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-semibold text-white shadow-md shadow-violet-200/40 transition hover:bg-violet-700"
                >
                  <Plus size={17} />
                  Tambah Kelas
                </button>
              </div>
            )}
          </div>

          {/* SEARCH */}
          <div
            className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${
              dark
                ? "border-[#33334b] bg-[#202033]"
                : "border-[#ececf3] bg-white"
            }`}
          >
            <Search size={19} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari program pembelajaran..."
              className={`w-full bg-transparent text-sm outline-none ${
                dark ? "text-white placeholder:text-gray-500" : "text-gray-800"
              }`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                className="text-gray-400 hover:text-violet-600"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* CATEGORY FILTER */}
          <div className="mb-6 flex flex-wrap gap-2">
            {["Semua Kelas", ...categoriesList.map((item) => item.name)].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                    activeCategory === category
                      ? "bg-violet-600 text-white shadow-md shadow-violet-200/40"
                      : dark
                        ? "bg-[#303047] text-gray-300 hover:bg-[#3b3b55]"
                        : "bg-white text-gray-600 hover:bg-violet-50 hover:text-violet-600"
                  }`}
                >
                  {category}
                </button>
              ),
            )}
          </div>

          {/* COURSE CARDS */}
          {filteredCourses.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => {
                const category = categoriesList.find(
                  (item) => item.name === course.category,
                );
                const CourseIcon = getIcon(category?.icon || "BookOpen");

                return (
                  <article
                    key={course.id}
                    className={`group overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      dark
                        ? "border-[#33334b] bg-[#202033]"
                        : "border-[#ececf3] bg-white"
                    }`}
                  >
                    <div
                      className="relative flex h-44 items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${
                          category?.gradientStart || "#7C3AED"
                        }, ${category?.gradientEnd || "#4F46E5"})`,
                      }}
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-white backdrop-blur-sm">
                        <CourseIcon size={40} />
                      </div>

                      <span
                        className="absolute left-5 top-5 rounded-full px-3 py-1.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: category?.badgeBg || "#EDE9FE",
                          color: category?.badgeText || "#6D28D9",
                        }}
                      >
                        {course.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold">{course.title}</h3>
                      <p className="mt-2 min-h-[48px] text-xs leading-relaxed text-gray-500">
                        {course.description}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={15} />
                          {course.lessons}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={15} />
                          {course.duration}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-50 py-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-600 hover:text-white"
                      >
                        Lihat Detail Kelas
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div
              className={`rounded-2xl border p-10 text-center ${
                dark
                  ? "border-[#33334b] bg-[#202033]"
                  : "border-[#ececf3] bg-white"
              }`}
            >
              <Search size={35} className="mx-auto text-gray-400" />
              <h3 className="mt-4 font-bold">Kelas tidak ditemukan</h3>
              <p className="mt-2 text-sm text-gray-500">
                Coba kata kunci atau kategori yang berbeda.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("Semua Kelas");
                }}
                className="mt-4 text-sm font-semibold text-violet-600"
              >
                Reset pencarian
              </button>
            </div>
          )}
        </section>

        {/* CATEGORY MANAGER */}
        {isAdmin && showCategoryManager && (
          <div
            className="fixed inset-0 z-[220] flex items-center justify-center bg-black/60 p-3 sm:p-5"
            onClick={() => setShowCategoryManager(false)}
          >
            <div
              className={`max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl p-5 shadow-2xl sm:p-7 ${
                dark ? "bg-[#202033] text-white" : "bg-white text-[#25263a]"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Kelola Kategori</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Atur kategori dan identitas visual katalog LMS.
                  </p>
                </div>
                <button
                  onClick={() => setShowCategoryManager(false)}
                  className="rounded-xl bg-gray-100 p-2 text-gray-600"
                  aria-label="Tutup pengelolaan kategori"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                {/* CATEGORY LIST */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold">Daftar Kategori</h3>
                    <button
                      onClick={openNewCategory}
                      className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      <Plus size={14} />
                      Tambah
                    </button>
                  </div>

                  <div className="space-y-2">
                    {categoriesList.map((category) => {
                      const CategoryIcon = getIcon(category.icon);
                      return (
                        <div
                          key={category.id}
                          className={`flex items-center gap-3 rounded-xl border p-3 ${
                            editingCategoryId === category.id
                              ? "border-violet-400 bg-violet-50/60"
                              : dark
                                ? "border-[#3b3b55] bg-[#29293f]"
                                : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                            style={{
                              backgroundColor: category.iconBg,
                              color: category.iconColor,
                            }}
                          >
                            <CategoryIcon size={21} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {category.name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {
                                courseList.filter(
                                  (course) => course.category === category.name,
                                ).length
                              }{" "}
                              kelas
                            </p>
                          </div>

                          <button
                            onClick={() => openEditCategory(category)}
                            className="rounded-lg p-2 text-violet-600 hover:bg-violet-100"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteCategory(category)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            aria-label={`Hapus ${category.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CATEGORY FORM */}
                <div
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    dark
                      ? "border-[#3b3b55] bg-[#29293f]"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold">
                        {editingCategoryId !== null
                          ? "Edit Kategori"
                          : "Kategori Baru"}
                      </h3>
                      <p className="mt-1 text-[10px] text-gray-500">
                        Atur nama, ikon, dan warna kategori.
                      </p>
                    </div>
                    {editingCategoryId !== null && (
                      <button
                        onClick={openNewCategory}
                        className="text-xs font-semibold text-violet-600"
                      >
                        Kategori Baru
                      </button>
                    )}
                  </div>

                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => setCategoryTab("main")}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        categoryTab === "main"
                          ? "bg-violet-600 text-white"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      Identitas
                    </button>
                    <button
                      onClick={() => setCategoryTab("details")}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        categoryTab === "details"
                          ? "bg-violet-600 text-white"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      Pengaturan Warna
                    </button>
                  </div>

                  {categoryTab === "main" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold">
                          Nama Kategori *
                        </label>
                        <input
                          value={categoryForm.name}
                          onChange={(event) =>
                            updateCategoryField("name", event.target.value)
                          }
                          placeholder="Contoh: AI Tools"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold">
                          Ikon Kategori
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {iconOptions.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.name}
                                onClick={() =>
                                  updateCategoryField("icon", item.name)
                                }
                                className={`flex h-11 items-center justify-center rounded-xl border ${
                                  categoryForm.icon === item.name
                                    ? "border-violet-500 bg-violet-100 text-violet-700"
                                    : "border-gray-200 bg-white text-gray-500"
                                }`}
                                aria-label={item.name}
                                title={item.name}
                              >
                                <Icon size={19} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold">
                          Warna Utama
                        </label>
                        <ColorField
                          label="Warna utama kategori"
                          value={categoryForm.color}
                          onChange={(value) =>
                            updateCategoryField("color", value)
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <h4 className="mb-3 text-xs font-bold">Warna Ikon</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <ColorField
                            label="Background ikon"
                            value={categoryForm.iconBg}
                            onChange={(value) =>
                              updateCategoryField("iconBg", value)
                            }
                          />
                          <ColorField
                            label="Warna ikon"
                            value={categoryForm.iconColor}
                            onChange={(value) =>
                              updateCategoryField("iconColor", value)
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 text-xs font-bold">Warna Badge</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <ColorField
                            label="Background badge"
                            value={categoryForm.badgeBg}
                            onChange={(value) =>
                              updateCategoryField("badgeBg", value)
                            }
                          />
                          <ColorField
                            label="Teks badge"
                            value={categoryForm.badgeText}
                            onChange={(value) =>
                              updateCategoryField("badgeText", value)
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 text-xs font-bold">
                          Warna Gradient Kartu
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <ColorField
                            label="Warna gradient 1"
                            value={categoryForm.gradientStart}
                            onChange={(value) =>
                              updateCategoryField("gradientStart", value)
                            }
                          />
                          <ColorField
                            label="Warna gradient 2"
                            value={categoryForm.gradientEnd}
                            onChange={(value) =>
                              updateCategoryField("gradientEnd", value)
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-xs font-bold">
                          Pilihan Palette
                        </h4>
                        <p className="mb-3 text-[10px] text-gray-500">
                          Klik salah satu warna untuk menerapkannya sebagai
                          warna utama.
                        </p>
                        <div className="space-y-2">
                          {palettes.map((palette, index) => (
                            <div key={index} className="flex gap-2">
                              {palette.map((color) => (
                                <button
                                  key={color}
                                  onClick={() =>
                                    updateCategoryField("color", color)
                                  }
                                  className={`h-8 flex-1 rounded-lg border-2 ${
                                    categoryForm.color === color
                                      ? "border-gray-800 ring-2 ring-violet-300"
                                      : "border-white"
                                  }`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                  aria-label={`Pilih warna ${color}`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LIVE PREVIEW */}
                  <div className="mt-6">
                    <h4 className="mb-3 text-xs font-bold">Preview Kategori</h4>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                      <div
                        className="flex h-28 items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${categoryForm.gradientStart}, ${categoryForm.gradientEnd})`,
                        }}
                      >
                        {(() => {
                          const PreviewIcon = getIcon(categoryForm.icon);
                          return (
                            <div
                              className="flex h-14 w-14 items-center justify-center rounded-2xl"
                              style={{
                                backgroundColor: categoryForm.iconBg,
                                color: categoryForm.iconColor,
                              }}
                            >
                              <PreviewIcon size={28} />
                            </div>
                          );
                        })()}
                      </div>

                      <div className="p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h5 className="truncate text-sm font-bold text-gray-800">
                            {categoryForm.name || "Nama Kategori"}
                          </h5>
                          <span
                            className="rounded-full px-2.5 py-1 text-[9px] font-semibold"
                            style={{
                              backgroundColor: categoryForm.badgeBg,
                              color: categoryForm.badgeText,
                            }}
                          >
                            {categoryForm.name || "Kategori"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          Contoh tampilan kartu kategori di katalog LMS.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      onClick={() => setShowCategoryManager(false)}
                      className="rounded-xl px-4 py-3 text-xs font-semibold text-gray-500 hover:bg-gray-200"
                    >
                      Batal
                    </button>
                    <button
                      onClick={saveCategory}
                      className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-semibold text-white hover:bg-violet-700"
                    >
                      <Check size={15} />
                      Simpan Kategori
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD COURSE MODAL */}
        {isAdmin && showAddCourse && (
          <div
            className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowAddCourse(false)}
          >
            <div
              className={`w-full max-w-xl rounded-3xl p-6 shadow-2xl sm:p-8 ${
                dark ? "bg-[#202033] text-white" : "bg-white text-[#25263a]"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">Tambah Kelas Baru</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Masukkan informasi program pembelajaran.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCourse(false)}
                  className="rounded-xl bg-gray-100 p-2 text-gray-600"
                  aria-label="Tutup formulir"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Nama Kelas *
                  </label>
                  <input
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    placeholder="Contoh: Tutorial Toko Lynk.id"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Kategori *
                  </label>
                  <div className="relative">
                    <select
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500"
                    >
                      <option value="">Pilih kategori</option>
                      {categoriesList.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-4 top-3.5 text-gray-400"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Kategori belum tersedia? Tambahkan melalui menu Kelola
                    Kategori.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Deskripsi Kelas
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(event) => setNewDescription(event.target.value)}
                    placeholder="Jelaskan isi dan tujuan pembelajaran..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddCourse(false)}
                  className="rounded-xl px-5 py-3 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddCourse}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  <Plus size={16} />
                  Simpan Kelas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COURSE DETAIL MODAL */}
        {selectedCourse && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedCourse(null)}
          >
            <div
              className={`max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 shadow-2xl sm:p-8 ${
                dark ? "bg-[#202033] text-white" : "bg-white text-[#25263a]"
              }`}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-violet-600">
                    {selectedCourse.category}
                  </span>
                  <h2 className="mt-2 text-2xl font-bold">
                    {selectedCourse.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="rounded-xl bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                  aria-label="Tutup detail"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm leading-relaxed text-gray-500">
                {selectedCourse.details}
              </p>

              <div className="mt-7">
                <h3 className="font-bold">Materi Pembelajaran</h3>
                <div className="mt-4 space-y-3">
                  {selectedCourse.topics.length > 0 ? (
                    selectedCourse.topics.map((topic, index) => (
                      <div
                        key={topic}
                        className={`flex items-center gap-3 rounded-xl p-3 ${
                          dark ? "bg-[#303047]" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium">{topic}</p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                      Materi untuk kelas ini belum ditambahkan.
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  const courseId = selectedCourse.id;
                  setSelectedCourse(null);
                  router.push(`/lms-ecourse/kelas/${courseId}`);
                }}
                className="mt-7 w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Lihat Detail Pembelajaran
                <ArrowRight size={15} className="ml-2 inline" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
