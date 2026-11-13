"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AppFooter from "@/components/layout/AppFooter";
import { createClient } from "@/lib/supabase/client";
import { loadLmsPrograms } from "@/lib/lms-data";
import { getVideoSource } from "@/lib/video-url";
import type { LearningMaterial, LearningProgram } from "@/lib/learning-data";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  ListVideo,
  Pencil,
  PlayCircle,
  Video,
} from "lucide-react";

function iconFor(type: LearningMaterial["type"]) {
  if (type === "video") return Video;
  if (type === "pdf") return FileText;
  if (type === "link") return ExternalLink;
  return BookOpen;
}

function VideoPlayer({ title, url }: { title: string; url?: string }) {
  const source = getVideoSource(url ?? "");
  const [failed, setFailed] = useState(false);

  if (source.kind === "invalid") {
    return (
      <div className="px-6 text-center text-sm text-white">
        <PlayCircle size={56} className="mx-auto mb-4 text-violet-300" />
        <p>{source.reason}</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="px-6 text-center text-sm text-white">
        <p>Video tidak dapat dimuat.</p>
        <p className="mt-2 text-xs text-gray-300">
          Periksa URL atau izin embed dari penyedia video.
        </p>
      </div>
    );
  }

  if (source.kind === "direct") {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
      >
        <source src={source.url} />
        <p className="p-6 text-center text-sm text-white">
          Browser tidak mendukung format video ini.
        </p>
      </video>
    );
  }

  return (
    <iframe
      src={source.url}
      title={title}
      className="h-full w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      onError={() => setFailed(true)}
    />
  );
}

function LearningDetailContent() {
  const { id: routeId } = useParams();
  const id = String(routeId);
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [program, setProgram] = useState<LearningProgram | undefined>(undefined);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Array<string | number>>([]);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [expanded, setExpanded] = useState<Array<string | number>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (mounted) setUserId(user?.id ?? null);
      let isAdmin = false;
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        isAdmin = data?.role === "admin";
        if (mounted) setRole(isAdmin ? "admin" : "member");
      }
      const result = await loadLmsPrograms({ publishedOnly: !isAdmin });
      if (!mounted) return;
      if (result.error) setError(result.error);
      const loaded = result.programs[id];
      setProgram(loaded);
      const materials =
        loaded?.modules.flatMap((module) => module.materials) ?? [];
      setActiveId(materials[0]?.id ?? null);
      setExpanded(loaded?.modules[0] ? [loaded.modules[0].id] : []);
      if (user) {
        const key = `edusmart_progress_${user.id}_${id}`;
        const lastKey = `edusmart_last_material_${user.id}_${id}`;
        try {
          const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
          if (Array.isArray(saved)) setCompleted(saved);
          const last = localStorage.getItem(lastKey);
          if (last) setActiveId(last);
        } catch {
          setCompleted([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!userId || activeId === null) return;
    localStorage.setItem(
      `edusmart_progress_${userId}_${id}`,
      JSON.stringify(completed),
    );
    localStorage.setItem(
      `edusmart_last_material_${userId}_${id}`,
      String(activeId),
    );
  }, [userId, id, activeId, completed]);

  const materials = useMemo(
    () => program?.modules.flatMap((module) => module.materials) ?? [],
    [program],
  );
  const active =
    materials.find((item) => String(item.id) === String(activeId)) ??
    materials[0];
  const activeIndex = active
    ? materials.findIndex((item) => item.id === active.id)
    : -1;
  const progress = materials.length
    ? Math.round(
        (completed.filter((item) =>
          materials.some((m) => String(m.id) === String(item)),
        ).length /
          materials.length) *
          100,
      )
    : 0;

  if (error)
    return (
      <DashboardLayout dark={dark} setDark={setDark}>
        <div className="p-8 text-center text-sm text-red-600">
          Gagal memuat LMS: {error}
        </div>
      </DashboardLayout>
    );
  if (!program)
    return (
      <DashboardLayout dark={dark} setDark={setDark}>
        <div className="p-8 text-center">
          <h1 className="font-bold">Kelas tidak ditemukan</h1>
          <button
            onClick={() => router.push("/lms-ecourse")}
            className="mt-4 rounded-xl bg-violet-600 px-5 py-3 text-sm text-white"
          >
            Kembali ke Katalog
          </button>
        </div>
      </DashboardLayout>
    );

  const toggleComplete = (materialId: string | number) =>
    setCompleted((old) =>
      old.some((item) => String(item) === String(materialId))
        ? old.filter((item) => String(item) !== String(materialId))
        : [...old, materialId],
    );
  const select = (material: LearningMaterial) => setActiveId(material.id);

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <div className="lms-soft-borders mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push("/lms-ecourse")}
            className="flex items-center gap-2 text-sm font-semibold text-violet-600"
          >
            <ArrowLeft size={17} />
            Kembali ke Katalog Kelas
          </button>
          {role === "admin" && (
            <button
              onClick={() => router.push(`/lms-ecourse/kelas/${id}/kelola`)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white"
            >
              <Pencil size={16} />
              Kelola Materi
            </button>
          )}
        </div>
        <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
          {program.category}
        </span>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{program.title}</h1>
        <p className="mt-2 text-sm text-gray-500">{program.description}</p>
        {materials.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            Materi pembelajaran belum tersedia.
          </div>
        ) : (
          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {active.type === "video" ? (
                <div className="relative flex aspect-video items-center justify-center bg-[#171727]">
                  <VideoPlayer
                    key={`${String(active.id)}-${active.videoUrl ?? ""}`}
                    title={active.title}
                    url={active.videoUrl}
                  />
                </div>
              ) : active.type === "pdf" ? (
                <div className="bg-gray-100">
                  {active.contentUrl ? (
                    <iframe
                      src={active.contentUrl}
                      title={active.title}
                      className="h-[650px] w-full"
                    />
                  ) : (
                    <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
                      Dokumen PDF belum tersedia.
                    </div>
                  )}
                </div>
              ) : active.type === "article" ? (
                <div className="min-h-[300px] whitespace-pre-wrap p-6 text-sm leading-8 text-gray-700 sm:p-10">
                  {active.articleContent?.trim() ||
                    "Isi artikel belum ditambahkan oleh Admin."}
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                  <ExternalLink size={54} className="mb-4 text-violet-600" />
                  <p className="text-sm text-gray-500">{active.description}</p>
                  {active.contentUrl && (
                    <a
                      href={active.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white"
                    >
                      Buka Materi
                    </a>
                  )}
                </div>
              )}
              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                    {active.type.toUpperCase()}
                  </span>
                  {active.duration && (
                    <span className="text-xs text-gray-500">
                      {active.duration}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-bold">{active.title}</h2>
                <p className="mt-3 text-sm text-gray-500">
                  {active.description}
                </p>
                <div className="mt-7 flex flex-wrap justify-between gap-3 border-t pt-5">
                  <button
                    disabled={activeIndex <= 0}
                    onClick={() => setActiveId(materials[activeIndex - 1]?.id)}
                    className="flex items-center gap-2 rounded-xl border px-4 py-3 text-xs disabled:opacity-40"
                  >
                    <ArrowLeft size={15} />
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => toggleComplete(active.id)}
                    className="rounded-xl bg-violet-600 px-4 py-3 text-xs font-semibold text-white"
                  >
                    <CheckCircle2 size={16} className="mr-2 inline" />
                    {completed.some(
                      (item) => String(item) === String(active.id),
                    )
                      ? "Sudah Diselesaikan"
                      : "Tandai Selesai"}
                  </button>
                  <button
                    disabled={activeIndex >= materials.length - 1}
                    onClick={() => setActiveId(materials[activeIndex + 1]?.id)}
                    className="flex items-center gap-2 rounded-xl bg-violet-100 px-4 py-3 text-xs text-violet-700 disabled:opacity-40"
                  >
                    Berikutnya
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </section>
            <aside className="space-y-5">
              <section className="rounded-2xl border border-violet-200 bg-white p-5">
                <h2 className="text-center text-lg font-bold text-gray-700">
                  Progress Pembelajaran
                </h2>
                <div className="mt-5 flex justify-between text-xs">
                  <span className="text-gray-500">Materi diselesaikan</span>
                  <strong className="text-violet-700">
                    {
                      completed.filter((item) =>
                        materials.some((m) => String(m.id) === String(item)),
                      ).length
                    }
                    /{materials.length}
                  </strong>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-violet-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-center text-sm font-bold text-violet-700">
                  {progress}% selesai
                </p>
              </section>
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 p-5">
                  <div className="flex items-center gap-2">
                    <ListVideo size={19} className="text-violet-600" />
                    <h2 className="font-bold">Daftar Materi</h2>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {program.modules.length} Modul · {materials.length} Materi
                  </p>
                </div>
                <div className="max-h-[650px] overflow-y-auto">
                  {program.modules.map((module, moduleIndex) => {
                    const isOpen = expanded.some(
                      (item) => String(item) === String(module.id),
                    );
                    return (
                      <div
                        key={String(module.id)}
                        className="border-b border-gray-100"
                      >
                        <button
                          onClick={() =>
                            setExpanded((old) =>
                              isOpen
                                ? old.filter(
                                    (item) =>
                                      String(item) !== String(module.id),
                                  )
                                : [...old, module.id],
                            )
                          }
                          className="flex w-full justify-between bg-gray-50 p-4 text-left"
                        >
                          <span className="text-sm font-bold">
                            {moduleIndex + 1}. {module.title}
                            <small className="mt-1 block text-xs font-normal text-gray-500">
                              {module.materials.length} materi
                            </small>
                          </span>
                          <span>{isOpen ? "−" : "+"}</span>
                        </button>
                        {isOpen &&
                          module.materials.map((item, index) => {
                            const Icon = iconFor(item.type);
                            return (
                              <div
                                key={String(item.id)}
                                className={`flex items-start gap-3 p-4 ${String(active.id) === String(item.id) ? "bg-violet-50" : ""}`}
                              >
                                <button onClick={() => toggleComplete(item.id)}>
                                  {completed.some(
                                    (value) =>
                                      String(value) === String(item.id),
                                  ) ? (
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
                                  onClick={() => select(item)}
                                  className="text-left text-sm font-semibold"
                                >
                                  <span>
                                    {moduleIndex + 1}.{index + 1} {item.title}
                                  </span>
                                  <small className="mt-2 flex items-center gap-1 text-xs font-normal text-gray-500">
                                    <Icon size={13} />
                                    {item.duration || item.type}
                                  </small>
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              </section>
            </aside>
          </div>
        )}
        <div className="mt-8">
          <AppFooter dark={dark} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function LearningDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          Memuat halaman pembelajaran...
        </div>
      }
    >
      <LearningDetailContent />
    </Suspense>
  );
}
