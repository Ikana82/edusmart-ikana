"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import {
  initialPrograms,
  readLearningPrograms,
  saveLearningPrograms,
  type LearningMaterial,
  type LearningModule,
  type MaterialType,
  type MaterialStatus,
} from "@/lib/learning-data";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Save,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  Eye,
} from "lucide-react";

function ManageLearningContent() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [dark, setDark] = useState(false);
  const [programs, setPrograms] = useState(initialPrograms);
  const [loaded, setLoaded] = useState(false);
  const [accessStatus, setAccessStatus] = useState<
    "checking" | "allowed" | "denied"
  >("checking");

  const [moduleTitle, setModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);

  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>("video");
  const [materialDescription, setMaterialDescription] = useState("");
  const [materialDuration, setMaterialDuration] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [materialStatus, setMaterialStatus] = useState<MaterialStatus>("draft");
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const saved = readLearningPrograms();
    setPrograms(saved);
    setLoaded(true);
  }, []);

  // PEMERIKSAAN HAK AKSES ADMIN
  useEffect(() => {
    let isMounted = true;

    async function checkAdminAccess() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (error || data?.role !== "admin") {
        setAccessStatus("denied");
        router.replace(`/lms-ecourse/kelas/${id}`);
        return;
      }

      setAccessStatus("allowed");
    }

    checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [id, router]);

  const program = programs[id];
  const modules = program?.modules ?? [];
  const selectedModule =
    modules.find((item) => item.id === selectedModuleId) ?? null;

  const updateProgram = (updatedModules: LearningModule[]) => {
    const updatedPrograms = {
      ...programs,
      [id]: {
        ...program,
        modules: updatedModules,
      },
    };

    setPrograms(updatedPrograms);
    saveLearningPrograms(updatedPrograms);
  };

  const resetMaterialForm = () => {
    setMaterialTitle("");
    setMaterialType("video");
    setMaterialDescription("");
    setMaterialDuration("");
    setMaterialUrl("");
    setArticleContent("");
    setMaterialStatus("draft");
    setEditingMaterialId(null);
  };

  const saveModule = () => {
    const title = moduleTitle.trim();
    if (!title) {
      alert("Silakan isi nama modul.");
      return;
    }

    let updatedModules: LearningModule[];

    if (editingModuleId !== null) {
      updatedModules = modules.map((item) =>
        item.id === editingModuleId ? { ...item, title } : item,
      );
    } else {
      const newModule: LearningModule = {
        id: Date.now(),
        title,
        materials: [],
      };
      updatedModules = [...modules, newModule];
      setSelectedModuleId(newModule.id);
    }

    updateProgram(updatedModules);
    setModuleTitle("");
    setEditingModuleId(null);
  };

  const editModule = (module: LearningModule) => {
    // Aktifkan modul yang dipilih untuk diedit
    setSelectedModuleId(module.id);

    // Masukkan nama modul ke formulir
    setModuleTitle(module.title);

    // Aktifkan mode edit
    setEditingModuleId(module.id);

    // Arahkan tampilan ke bagian formulir modul
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteModule = (moduleId: number) => {
    if (!confirm("Yakin ingin menghapus modul beserta seluruh materinya?")) {
      return;
    }

    updateProgram(modules.filter((item) => item.id !== moduleId));

    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
      resetMaterialForm();
    }
  };

  const editMaterial = (material: LearningMaterial) => {
    setMaterialTitle(material.title);
    setMaterialType(material.type);
    setMaterialDescription(material.description);
    setMaterialDuration(material.duration ?? "");
    setMaterialUrl(
      material.type === "video"
        ? (material.videoUrl ?? "")
        : (material.contentUrl ?? ""),
    );
    setArticleContent(material.articleContent ?? "");
    setMaterialStatus(material.status);
    setEditingMaterialId(material.id);
  };

  const saveMaterial = () => {
    if (!selectedModule) {
      alert("Pilih modul terlebih dahulu.");
      return;
    }

    if (!materialTitle.trim()) {
      alert("Silakan isi judul materi.");
      return;
    }

    if (!materialDescription.trim()) {
      alert("Silakan isi deskripsi materi.");
      return;
    }

    const material: LearningMaterial = {
      id: editingMaterialId ?? Date.now(),
      title: materialTitle.trim(),
      type: materialType,
      description: materialDescription.trim(),
      duration: materialDuration.trim() || undefined,
      status: materialStatus,
      ...(materialType === "video"
        ? { videoUrl: materialUrl.trim() || undefined }
        : { contentUrl: materialUrl.trim() || undefined }),
      ...(materialType === "article"
        ? { articleContent: articleContent.trim() }
        : {}),
    };

    const updatedModules = modules.map((module) => {
      if (module.id !== selectedModule.id) return module;

      const updatedMaterials =
        editingMaterialId !== null
          ? module.materials.map((item) =>
              item.id === editingMaterialId ? material : item,
            )
          : [...module.materials, material];

      return { ...module, materials: updatedMaterials };
    });

    updateProgram(updatedModules);
    resetMaterialForm();
  };

  const deleteMaterial = (materialId: number) => {
    if (!selectedModule) return;

    if (!confirm("Yakin ingin menghapus materi ini?")) return;

    const updatedModules = modules.map((module) =>
      module.id === selectedModule.id
        ? {
            ...module,
            materials: module.materials.filter(
              (item) => item.id !== materialId,
            ),
          }
        : module,
    );

    updateProgram(updatedModules);

    if (editingMaterialId === materialId) {
      resetMaterialForm();
    }
  };

  const getIcon = (type: MaterialType) => {
    if (type === "video") return Video;
    if (type === "pdf") return FileText;
    if (type === "link") return ExternalLink;
    return BookOpen;
  };

  if (accessStatus !== "allowed") {
    return (
      <DashboardLayout dark={dark} setDark={setDark}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-gray-500">Memeriksa hak akses...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!loaded) {
    return (
      <DashboardLayout dark={dark} setDark={setDark}>
        <div className="p-8 text-center text-sm text-gray-500">
          Memuat data LMS...
        </div>
      </DashboardLayout>
    );
  }

  if (!program) {
    return (
      <DashboardLayout dark={dark} setDark={setDark}>
        <div className="p-8 text-center">
          <h1 className="font-bold">Kelas tidak ditemukan</h1>
          <button
            onClick={() => router.push("/lms-ecourse")}
            className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm text-white"
          >
            Kembali ke Katalog
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
        <button
          onClick={() => router.push(`/lms-ecourse/kelas/${id}`)}
          className="flex items-center gap-2 text-sm font-semibold text-violet-600"
        >
          <ArrowLeft size={17} />
          Kembali ke Halaman Pembelajaran
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              Pengelolaan LMS
            </span>
            <h1 className="mt-3 text-2xl font-bold text-gray-800">
              Kelola Materi Pembelajaran
            </h1>
            <p className="mt-1 text-sm text-gray-500">{program.title}</p>
          </div>

          <button
            onClick={() => router.push(`/lms-ecourse/kelas/${id}`)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <Eye size={17} />
            Lihat Halaman Member
          </button>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
          {/* KELOLA MODUL */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-gray-800">Daftar Modul</h2>
            <p className="mt-1 text-xs text-gray-500">
              Tambahkan dan atur urutan modul pembelajaran.
            </p>

            <div className="mt-5 space-y-3">
              <input
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Nama modul..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              />

              <button
                onClick={saveModule}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
              >
                {editingModuleId !== null ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {editingModuleId !== null ? "Simpan Perubahan" : "Tambah Modul"}
              </button>

              {editingModuleId !== null && (
                <button
                  onClick={() => {
                    setModuleTitle("");
                    setEditingModuleId(null);
                  }}
                  className="w-full text-xs text-gray-500"
                >
                  Batalkan edit
                </button>
              )}
            </div>

            <div className="mt-6 space-y-2">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`rounded-xl border p-3 ${
                    selectedModuleId === module.id
                      ? "border-violet-300 bg-violet-50"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedModuleId(module.id);
                      resetMaterialForm();
                    }}
                    className="w-full text-left"
                  >
                    <p className="text-xs font-semibold text-violet-600">
                      MODUL {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-800">
                      {module.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {module.materials.length} materi
                    </p>
                  </button>

                  <div className="mt-3 flex gap-2 border-t border-gray-200 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModuleTitle(module.title);
                        setEditingModuleId(module.id);

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteModule(module.id)}
                      className="flex items-center gap-1 text-xs font-medium text-red-500"
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                  </div>
                </div>
              ))}

              {modules.length === 0 && (
                <p className="rounded-xl bg-gray-50 p-4 text-center text-xs text-gray-500">
                  Belum ada modul. Silakan tambahkan modul pertama.
                </p>
              )}
            </div>
          </section>

          {/* KELOLA MATERI */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-gray-800">
                {editingMaterialId !== null ? "Edit Materi" : "Tambah Materi"}
              </h2>

              {!selectedModule ? (
                <p className="mt-4 rounded-xl bg-violet-50 p-5 text-sm text-violet-700">
                  Pilih salah satu modul di sebelah kiri untuk mulai mengelola
                  materinya.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-xs text-gray-500">
                    Materi untuk modul: <strong>{selectedModule.title}</strong>
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-semibold text-gray-600">
                        Judul Materi
                      </label>
                      <input
                        value={materialTitle}
                        onChange={(e) => setMaterialTitle(e.target.value)}
                        placeholder="Contoh: Mengenal Dasar AI"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-gray-600">
                        Jenis Materi
                      </label>
                      <select
                        value={materialType}
                        onChange={(e) =>
                          setMaterialType(e.target.value as MaterialType)
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                      >
                        <option value="video">Video Pembelajaran</option>
                        <option value="pdf">File PDF</option>
                        <option value="article">Artikel</option>
                        <option value="link">Link Eksternal</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-gray-600">
                        Status Materi
                      </label>
                      <select
                        value={materialStatus}
                        onChange={(e) =>
                          setMaterialStatus(e.target.value as MaterialStatus)
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-semibold text-gray-600">
                        Deskripsi Materi
                      </label>
                      <textarea
                        value={materialDescription}
                        onChange={(e) => setMaterialDescription(e.target.value)}
                        rows={3}
                        placeholder="Tuliskan penjelasan singkat materi..."
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                      />
                    </div>

                    {materialType === "video" && (
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          URL Video
                        </label>
                        <input
                          value={materialUrl}
                          onChange={(e) => setMaterialUrl(e.target.value)}
                          placeholder="Contoh: https://www.youtube.com/embed/..."
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Untuk YouTube, gunakan format URL embed.
                        </p>
                      </div>
                    )}

                    {materialType === "video" && (
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          Durasi Video
                        </label>
                        <input
                          value={materialDuration}
                          onChange={(e) => setMaterialDuration(e.target.value)}
                          placeholder="Contoh: 14:17 Menit"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                        />
                      </div>
                    )}

                    {(materialType === "pdf" || materialType === "link") && (
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          {materialType === "pdf" ? "URL File PDF" : "URL Link"}
                        </label>
                        <input
                          value={materialUrl}
                          onChange={(e) => setMaterialUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                        />
                      </div>
                    )}

                    {materialType === "article" && (
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">
                          Isi Artikel
                        </label>
                        <textarea
                          value={articleContent}
                          onChange={(e) => setArticleContent(e.target.value)}
                          rows={7}
                          placeholder="Tuliskan isi materi artikel di sini..."
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={saveMaterial}
                      className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      <Save size={16} />
                      {editingMaterialId !== null
                        ? "Simpan Perubahan"
                        : "Simpan Materi"}
                    </button>

                    {editingMaterialId !== null && (
                      <button
                        onClick={resetMaterialForm}
                        className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </>
              )}
            </section>

            {/* DAFTAR MATERI */}
            {selectedModule && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Materi dalam Modul
                </h2>

                <div className="mt-4 space-y-3">
                  {selectedModule.materials.map((material, index) => {
                    const Icon = getIcon(material.type);

                    return (
                      <div
                        key={material.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
                            <Icon size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-violet-600">
                              MATERI {index + 1}
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-800">
                              {material.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {material.type.toUpperCase()}
                              {material.duration
                                ? ` · ${material.duration}`
                                : ""}
                            </p>
                            <span
                              className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                material.status === "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {material.status === "published"
                                ? "Published"
                                : "Draft"}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => editMaterial(material)}
                            className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"
                            aria-label="Edit materi"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteMaterial(material.id)}
                            className="rounded-lg border border-gray-200 p-2 text-red-500 hover:bg-red-50"
                            aria-label="Hapus materi"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {selectedModule.materials.length === 0 && (
                    <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
                      Belum ada materi dalam modul ini.
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ManageLearningPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          Memuat halaman pengelolaan...
        </div>
      }
    >
      <ManageLearningContent />
    </Suspense>
  );
}
