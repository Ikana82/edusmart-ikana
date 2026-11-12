"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createClient } from "@/lib/supabase/client";
import {
  initialPrograms,
  readLearningPrograms,
  type LearningMaterial,
} from "@/lib/learning-data";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Pencil,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  ListVideo,
  PlayCircle,
  Video,
} from "lucide-react";

function getMaterialIcon(type: LearningMaterial["type"]) {
  if (type === "video") return Video;
  if (type === "pdf") return FileText;
  if (type === "link") return ExternalLink;
  return BookOpen;
}

function LearningDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [programs, setPrograms] = useState(initialPrograms);
  const [dark, setDark] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [activeMaterialId, setActiveMaterialId] = useState<number | null>(null);
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);
  const [userRole, setUserRole] = useState<"admin" | "member" | null>(null);

  useEffect(() => {
    const savedPrograms = readLearningPrograms();

    setPrograms(savedPrograms);

    const firstMaterial =
      savedPrograms[id]?.modules[0]?.materials[0]?.id ?? null;

    setActiveMaterialId(firstMaterial);

    const savedProgress = localStorage.getItem(`edusmart_progress_${id}`);

    const savedLastMaterial = localStorage.getItem(
      `edusmart_last_material_${id}`,
    );

    if (savedProgress) {
      try {
        setCompleted(JSON.parse(savedProgress));
      } catch {
        setCompleted([]);
      }
    } else {
      setCompleted([]);
    }

    if (savedLastMaterial) {
      setActiveMaterialId(Number(savedLastMaterial));
    }

    setProgressLoaded(true);
  }, [id]);

  // SIMPAN PROGRESS PEMBELAJARAN OTOMATIS
  useEffect(() => {
    if (!progressLoaded) return;

    localStorage.setItem(`edusmart_progress_${id}`, JSON.stringify(completed));

    if (activeMaterialId !== null) {
      localStorage.setItem(
        `edusmart_last_material_${id}`,
        String(activeMaterialId),
      );
    }
  }, [id, completed, activeMaterialId, progressLoaded]);

  // MEMERIKSA ROLE PENGGUNA
  useEffect(() => {
    let isMounted = true;

    async function getUserRole() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (!error && data) {
        setUserRole(data.role === "admin" ? "admin" : "member");
      } else {
        setUserRole("member");
      }
    }

    getUserRole();

    return () => {
      isMounted = false;
    };
  }, []);

  const program = programs[id];

  if (!program) {
    return (
      <DashboardLayout dark={dark} setDark={setDark}>
        <div className="p-8 text-center">
          <h1 className="text-xl font-bold">Kelas tidak ditemukan</h1>
          <button
            onClick={() => router.push("/lms-ecourse")}
            className="mt-4 rounded-xl bg-violet-600 px-5 py-3 text-sm text-white"
          >
            Kembali ke Katalog
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const allMaterials = program.modules.flatMap((module) => module.materials);

  const activeMaterial =
    allMaterials.find((material) => material.id === activeMaterialId) ??
    allMaterials[0];

  const totalMaterials = allMaterials.length;
  const completedCount = completed.length;
  const progress =
    totalMaterials > 0
      ? Math.round((completedCount / totalMaterials) * 100)
      : 0;

  const activeIndex = allMaterials.findIndex(
    (material) => material.id === activeMaterial?.id,
  );

  const toggleComplete = (materialId: number) => {
    setCompleted((previous) =>
      previous.includes(materialId)
        ? previous.filter((id) => id !== materialId)
        : [...previous, materialId],
    );
  };

  const selectMaterial = (material: LearningMaterial) => {
    setActiveMaterialId(material.id);
  };

  const goToMaterial = (direction: number) => {
    const next = allMaterials[activeIndex + direction];
    if (next) setActiveMaterialId(next.id);
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules((previous) =>
      previous.includes(moduleId)
        ? previous.filter((id) => id !== moduleId)
        : [...previous, moduleId],
    );
  };

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push("/lms-ecourse")}
            className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800"
          >
            <ArrowLeft size={17} />
            Kembali ke Katalog Kelas
          </button>

          {userRole === "admin" && (
            <button
              onClick={() => router.push(`/lms-ecourse/kelas/${id}/kelola`)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              <Pencil size={16} />
              Kelola Materi
            </button>
          )}
        </div>

        <div className="mb-6">
          <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
            {program.category}
          </span>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            {program.title}
          </h1>
          <p className="mt-2 text-sm text-gray-500">{program.description}</p>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* AREA MATERI */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {/* VIDEO / CONTENT */}
            {activeMaterial.type === "video" ? (
              <div className="relative flex aspect-video items-center justify-center bg-[#171727]">
                {activeMaterial.videoUrl ? (
                  <iframe
                    src={activeMaterial.videoUrl}
                    title={activeMaterial.title}
                    className="h-full w-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <div className="px-6 text-center text-white">
                    <PlayCircle
                      size={64}
                      className="mx-auto mb-4 text-violet-300"
                    />
                    <h3 className="font-semibold">Video belum ditambahkan</h3>
                    <p className="mt-2 text-xs text-gray-400">
                      Video pembelajaran belum tersedia.
                    </p>
                  </div>
                )}
              </div>
            ) : activeMaterial.type === "pdf" ? (
              <div className="bg-gray-100">
                {activeMaterial.contentUrl ? (
                  <iframe
                    src={activeMaterial.contentUrl}
                    title={activeMaterial.title}
                    className="h-[650px] w-full"
                  />
                ) : (
                  <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                    <FileText size={54} className="mb-4 text-violet-600" />
                    <h3 className="font-bold text-gray-800">
                      Dokumen PDF belum tersedia
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Admin belum menambahkan file PDF untuk materi ini.
                    </p>
                  </div>
                )}
              </div>
            ) : activeMaterial.type === "article" ? (
              <div className="min-h-[300px] bg-white p-6 sm:p-10">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-5 flex items-center gap-2 text-violet-600">
                    <BookOpen size={22} />
                    <span className="text-sm font-semibold">
                      Materi Artikel
                    </span>
                  </div>

                  {activeMaterial.articleContent?.trim() ? (
                    <div className="whitespace-pre-wrap text-sm leading-8 text-gray-700 sm:text-base">
                      {activeMaterial.articleContent}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Isi artikel belum ditambahkan oleh Admin.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 p-8 text-center">
                <ExternalLink size={54} className="mb-4 text-violet-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  Materi Tautan Eksternal
                </h3>
                <p className="mt-2 max-w-md text-sm text-gray-500">
                  {activeMaterial.description}
                </p>

                {activeMaterial.contentUrl ? (
                  <a
                    href={activeMaterial.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    <ExternalLink size={16} />
                    Buka Materi
                  </a>
                ) : (
                  <p className="mt-5 text-xs text-gray-400">
                    Tautan belum ditambahkan oleh Admin.
                  </p>
                )}
              </div>
            )}

            {/* MATERIAL INFO */}
            <div className="p-5 sm:p-7">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                  {(() => {
                    const Icon = getMaterialIcon(activeMaterial.type);
                    return <Icon size={15} />;
                  })()}
                  {activeMaterial.type.toUpperCase()}
                </span>

                {activeMaterial.duration && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock3 size={15} />
                    {activeMaterial.duration}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold leading-relaxed text-gray-800 sm:text-2xl">
                {activeMaterial.title}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {activeMaterial.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
                <button
                  onClick={() => goToMaterial(-1)}
                  disabled={activeIndex <= 0}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-xs font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={15} />
                  Sebelumnya
                </button>

                <button
                  onClick={() => toggleComplete(activeMaterial.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold ${
                    completed.includes(activeMaterial.id)
                      ? "bg-green-100 text-green-700"
                      : "bg-violet-600 text-white hover:bg-violet-700"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  {completed.includes(activeMaterial.id)
                    ? "Sudah Diselesaikan"
                    : "Tandai Selesai"}
                </button>

                <button
                  onClick={() => goToMaterial(1)}
                  disabled={activeIndex >= allMaterials.length - 1}
                  className="flex items-center gap-2 rounded-xl bg-violet-100 px-4 py-3 text-xs font-semibold text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside className="space-y-5">
            {/* PROGRESS */}
            <section className="rounded-2xl border border-violet-200 bg-white p-5">
              <h2 className="text-center text-lg font-bold text-gray-700">
                Progress Pembelajaran
              </h2>

              <div className="mt-5 flex items-center justify-between text-xs">
                <span className="text-gray-500">Materi diselesaikan</span>
                <strong className="text-violet-700">
                  {completedCount}/{totalMaterials}
                </strong>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-3 text-center text-sm font-bold text-violet-700">
                {progress}% selesai
              </p>

              <div className="mt-4 rounded-xl bg-violet-50 p-3 text-center text-xs text-violet-700">
                {progress === 100
                  ? "Selamat! Semua materi telah diselesaikan."
                  : "Terus lanjutkan pembelajaranmu!"}
              </div>
            </section>

            {/* MODULE LIST */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 p-5">
                <div className="flex items-center gap-2">
                  <ListVideo size={19} className="text-violet-600" />
                  <h2 className="font-bold text-gray-800">Daftar Materi</h2>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {program.modules.length} Modul · {totalMaterials} Materi
                </p>
              </div>

              <div className="max-h-[650px] overflow-y-auto">
                {program.modules.map((module, moduleIndex) => {
                  const moduleCompleted = module.materials.filter((item) =>
                    completed.includes(item.id),
                  ).length;

                  const expanded = expandedModules.includes(module.id);

                  return (
                    <div key={module.id} className="border-b border-gray-100">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="flex w-full items-center justify-between gap-3 bg-gray-50 p-4 text-left hover:bg-violet-50"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800">
                            {module.title}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-500">
                            {moduleCompleted}/{module.materials.length} materi
                            selesai
                          </p>
                        </div>
                        <span className="text-lg text-gray-400">
                          {expanded ? "−" : "+"}
                        </span>
                      </button>

                      {expanded && (
                        <div className="divide-y divide-gray-50">
                          {module.materials.map((material, materialIndex) => {
                            const Icon = getMaterialIcon(material.type);
                            const isCompleted = completed.includes(material.id);
                            const isActive = activeMaterial.id === material.id;

                            return (
                              <div
                                key={material.id}
                                className={`flex items-start gap-3 p-4 ${
                                  isActive ? "bg-violet-50" : "bg-white"
                                }`}
                              >
                                <button
                                  onClick={() => toggleComplete(material.id)}
                                  className="mt-1 shrink-0"
                                  aria-label={
                                    isCompleted
                                      ? "Batalkan selesai"
                                      : "Tandai selesai"
                                  }
                                >
                                  {isCompleted ? (
                                    <CheckCircle2
                                      size={21}
                                      className="text-violet-600"
                                    />
                                  ) : (
                                    <Circle
                                      size={21}
                                      className="text-gray-400"
                                    />
                                  )}
                                </button>

                                <button
                                  onClick={() => selectMaterial(material)}
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <p
                                    className={`text-sm font-semibold leading-relaxed ${
                                      isActive
                                        ? "text-violet-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {moduleIndex + 1}.{materialIndex + 1}{" "}
                                    {material.title}
                                  </p>

                                  <span className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
                                    <Icon size={13} />
                                    {material.duration || material.type}
                                  </span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function LearningDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-gray-500">
            Memuat halaman pembelajaran...
          </p>
        </div>
      }
    >
      <LearningDetailContent />
    </Suspense>
  );
}
