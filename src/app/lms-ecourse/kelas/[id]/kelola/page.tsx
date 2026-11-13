"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AppFooter from "@/components/layout/AppFooter";
import { createClient } from "@/lib/supabase/client";
import { loadLmsPrograms } from "@/lib/lms-data";
import { getVideoSource } from "@/lib/video-url";
import type { LearningMaterial, LearningModule, MaterialStatus, MaterialType } from "@/lib/learning-data";
import { ArrowLeft, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

function ManageLearningContent() {
  const { id: routeId } = useParams();
  const id = String(routeId);
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [program, setProgram] = useState<Awaited<ReturnType<typeof loadLmsPrograms>>["programs"][string]>();
  const [access, setAccess] = useState<"checking" | "allowed" | "denied">("checking");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | number | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [editingMaterialId, setEditingMaterialId] = useState<string | number | null>(null);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>("video");
  const [materialDescription, setMaterialDescription] = useState("");
  const [materialDuration, setMaterialDuration] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [materialStatus, setMaterialStatus] = useState<MaterialStatus>("draft");

  const refresh = async () => {
    const result = await loadLmsPrograms();
    if (result.error) setError(result.error);
    const loaded = result.programs[id];
    setProgram(loaded);
    if (!selectedId && loaded?.modules[0]) setSelectedId(loaded.modules[0].id);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (!mounted) return;
      if (profileError || profile?.role !== "admin") { setAccess("denied"); router.replace(`/lms-ecourse/kelas/${id}`); return; }
      setAccess("allowed");
      await refresh();
    })();
    return () => { mounted = false; };
  }, [id, router]);

  const modules = program?.modules ?? [];
  const selected = modules.find((item) => String(item.id) === String(selectedId));
  const clearMaterial = () => { setEditingMaterialId(null); setMaterialTitle(""); setMaterialType("video"); setMaterialDescription(""); setMaterialDuration(""); setMaterialUrl(""); setArticleContent(""); setMaterialStatus("draft"); };
  const fail = (message: string) => {
    setError(message);
    toast.error(message);
  };

  const saveModule = async () => {
    const title = moduleTitle.trim();
    if (!title) return fail("Nama modul wajib diisi.");
    const supabase = createClient();
    const result = editingModuleId
      ? await supabase.from("lms_modules").update({ title }).eq("id", editingModuleId)
      : await supabase.from("lms_modules").insert({ program_id: id, title, position: modules.length });
    if (result.error) return fail(result.error.message);
    setModuleTitle(""); setEditingModuleId(null); await refresh();
  };

  const removeModule = async (module: LearningModule) => {
    if (!confirm("Hapus modul beserta seluruh materinya?")) return;
    const supabase = createClient();
    const materialResult = await supabase.from("lms_materials").delete().eq("module_id", module.id);
    if (materialResult.error) return fail(materialResult.error.message);
    const result = await supabase.from("lms_modules").delete().eq("id", module.id);
    if (result.error) return fail(result.error.message);
    setSelectedId(null); clearMaterial(); await refresh();
  };

  const editMaterial = (material: LearningMaterial) => {
    setEditingMaterialId(material.id); setMaterialTitle(material.title); setMaterialType(material.type); setMaterialDescription(material.description); setMaterialDuration(material.duration ?? ""); setMaterialUrl(material.type === "video" ? material.videoUrl ?? "" : material.contentUrl ?? ""); setArticleContent(material.articleContent ?? ""); setMaterialStatus(material.status);
  };

  const saveMaterial = async () => {
    if (!selected) return fail("Pilih modul terlebih dahulu.");
    if (!materialTitle.trim() || !materialDescription.trim()) return fail("Judul dan deskripsi materi wajib diisi.");
    if (materialType === "video") {
      const videoSource = getVideoSource(materialUrl);
      if (videoSource.kind === "invalid") return fail(videoSource.reason);
    }
    const payload = { module_id: selected.id, title: materialTitle.trim(), type: materialType, duration: materialDuration.trim() || null, description: materialDescription.trim(), video_url: materialType === "video" ? materialUrl.trim() || null : null, content_url: materialType !== "video" ? materialUrl.trim() || null : null, article_content: materialType === "article" ? articleContent.trim() || null : null, status: materialStatus, position: editingMaterialId ? selected.materials.findIndex((item) => String(item.id) === String(editingMaterialId)) : selected.materials.length };
    const supabase = createClient();
    const result = editingMaterialId ? await supabase.from("lms_materials").update(payload).eq("id", editingMaterialId) : await supabase.from("lms_materials").insert(payload);
    if (result.error) return fail(result.error.message);
    clearMaterial();
    await refresh();
    toast.success(editingMaterialId ? "Materi berhasil diperbarui." : "Materi berhasil ditambahkan.");
  };

  const removeMaterial = async (material: LearningMaterial) => {
    if (!confirm("Hapus materi ini?")) return;
    const { error: deleteError } = await createClient().from("lms_materials").delete().eq("id", material.id);
    if (deleteError) return fail(deleteError.message);
    clearMaterial(); await refresh();
  };

  if (access !== "allowed") return <DashboardLayout dark={dark} setDark={setDark}><div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-500">{access === "denied" ? "Akses ditolak." : "Memeriksa hak akses..."}</div></DashboardLayout>;
  if (!program) return <DashboardLayout dark={dark} setDark={setDark}><div className="p-8 text-center text-sm text-gray-500">{error || "Memuat data LMS..."}</div></DashboardLayout>;

  return <DashboardLayout dark={dark} setDark={setDark}><div className="lms-soft-borders mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
    <button onClick={() => router.push(`/lms-ecourse/kelas/${id}`)} className="flex items-center gap-2 text-sm font-semibold text-violet-600"><ArrowLeft size={17} />Kembali ke Halaman Pembelajaran</button>
    <div><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">Pengelolaan LMS</span><h1 className="mt-3 text-2xl font-bold">Kelola Materi Pembelajaran</h1><p className="mt-1 text-sm text-gray-500">{program.title}</p></div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid items-start gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
      <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">Daftar Modul</h2><p className="mt-1 text-xs text-gray-500">Tambahkan dan atur urutan modul pembelajaran.</p><div className="mt-5 space-y-3"><input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Nama modul..." className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-violet-500" /><button onClick={saveModule} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white">{editingModuleId ? <Save size={16} /> : <Plus size={16} />}{editingModuleId ? "Simpan Perubahan" : "Tambah Modul"}</button></div><div className="mt-6 space-y-2">{modules.map((module, index) => <div key={String(module.id)} className={`rounded-xl border p-3 ${String(selectedId) === String(module.id) ? "border-violet-300 bg-violet-50" : "bg-gray-50"}`}><button onClick={() => { setSelectedId(module.id); clearMaterial(); }} className="w-full text-left"><p className="text-xs font-semibold text-violet-600">MODUL {index + 1}</p><p className="mt-1 text-sm font-bold">{module.title}</p><p className="mt-1 text-xs text-gray-500">{module.materials.length} materi</p></button><div className="mt-3 flex gap-3 border-t pt-2"><button onClick={() => { setEditingModuleId(module.id); setModuleTitle(module.title); }} className="flex items-center gap-1 text-xs text-blue-600"><Pencil size={13} />Edit</button><button onClick={() => removeModule(module)} className="flex items-center gap-1 text-xs text-red-500"><Trash2 size={13} />Hapus</button></div></div>)}{!modules.length && <p className="rounded-xl bg-gray-50 p-4 text-center text-xs text-gray-500">Belum ada modul.</p>}</div></section>
      <div className="space-y-6"><section className="rounded-2xl border bg-white p-5 sm:p-6"><h2 className="text-lg font-bold">{editingMaterialId ? "Edit Materi" : "Tambah Materi"}</h2>{!selected ? <p className="mt-4 rounded-xl bg-violet-50 p-5 text-sm text-violet-700">Pilih modul di sebelah kiri.</p> : <div className="mt-5 grid gap-4 sm:grid-cols-2"><input value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} placeholder="Judul materi" className="sm:col-span-2 rounded-xl border px-4 py-3 text-sm" /><select value={materialType} onChange={(e) => setMaterialType(e.target.value as MaterialType)} className="rounded-xl border px-4 py-3 text-sm"><option value="video">Video</option><option value="pdf">PDF</option><option value="article">Artikel</option><option value="link">Link</option></select><select value={materialStatus} onChange={(e) => setMaterialStatus(e.target.value as MaterialStatus)} className="rounded-xl border px-4 py-3 text-sm"><option value="draft">Draft</option><option value="published">Published</option></select><textarea value={materialDescription} onChange={(e) => setMaterialDescription(e.target.value)} rows={3} placeholder="Deskripsi materi" className="sm:col-span-2 rounded-xl border px-4 py-3 text-sm" />{materialType !== "article" && <input value={materialUrl} onChange={(e) => setMaterialUrl(e.target.value)} placeholder={materialType === "video" ? "URL video embed" : "URL materi"} className="sm:col-span-2 rounded-xl border px-4 py-3 text-sm" />}{materialType === "video" && <input value={materialDuration} onChange={(e) => setMaterialDuration(e.target.value)} placeholder="Durasi" className="rounded-xl border px-4 py-3 text-sm" />}{materialType === "article" && <textarea value={articleContent} onChange={(e) => setArticleContent(e.target.value)} rows={7} placeholder="Isi artikel" className="sm:col-span-2 rounded-xl border px-4 py-3 text-sm" />}<div className="sm:col-span-2 flex gap-3"><button onClick={saveMaterial} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white"><Save size={16} />Simpan Materi</button>{editingMaterialId && <button onClick={clearMaterial} className="rounded-xl border px-5 py-3 text-sm">Batalkan</button>}</div></div>}</section>
      {selected && <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">Materi dalam Modul</h2><div className="mt-4 space-y-3">{selected.materials.map((material, index) => <div key={String(material.id)} className="flex items-center justify-between gap-3 rounded-xl border bg-gray-50 p-4"><div><p className="text-xs font-semibold text-violet-600">MATERI {index + 1}</p><p className="text-sm font-bold">{material.title}</p><p className="text-xs text-gray-500">{material.type.toUpperCase()} · {material.status}</p></div><div className="flex gap-2"><button onClick={() => editMaterial(material)} className="rounded-lg border p-2 text-blue-600"><Pencil size={16} /></button><button onClick={() => removeMaterial(material)} className="rounded-lg border p-2 text-red-500"><Trash2 size={16} /></button></div></div>)}{!selected.materials.length && <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">Belum ada materi.</p>}</div></section>}</div>
    </div>
    <div className="mt-8">
      <AppFooter dark={dark} />
    </div>
  </div></DashboardLayout>;
}

export default function ManageLearningPage() { return <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Memuat halaman pengelolaan...</div>}><ManageLearningContent /></Suspense>; }
