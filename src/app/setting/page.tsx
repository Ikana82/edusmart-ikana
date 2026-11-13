"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  UserRound,
  Upload,
  Save,
  ShieldCheck,
  Palette,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AppFooter from "@/components/layout/AppFooter";
import { createClient } from "@/lib/supabase/client";

const avatars = [
  ["girl", "👩🏻‍🎓"],
  ["hijab", "🧕🏻"],
  ["teacher", "👩🏻‍🏫"],
  ["creator", "👩🏻‍💻"],
  ["boy", "👨🏻‍🎓"],
  ["boy-creator", "👨🏻‍💻"],
  ["artist", "🧑🏻‍🎨"],
  ["bear", "🐻"],
  ["cat", "🐱"],
  ["rabbit", "🐰"],
  ["fox", "🦊"],
  ["panda", "🐼"],
  ["robot", "🤖"],
  ["star", "🌟"],
  ["flower", "🌸"],
  ["rainbow", "🌈"],
];

const themes = [
  {
    id: "purple",
    name: "Purple Dream",
    colors: ["#7C3AED", "#8B5CF6", "#C4B5FD", "#F3E8FF"],
  },
  {
    id: "blue",
    name: "Ocean Blue",
    colors: ["#2563EB", "#3B82F6", "#93C5FD", "#DBEAFE"],
  },
  {
    id: "pink",
    name: "Soft Pink",
    colors: ["#DB2777", "#EC4899", "#F9A8D4", "#FCE7F3"],
  },
  {
    id: "green",
    name: "Mint Green",
    colors: ["#059669", "#10B981", "#6EE7B7", "#D1FAE5"],
  },
  {
    id: "orange",
    name: "Warm Peach",
    colors: ["#EA580C", "#F97316", "#FDBA74", "#FFEDD5"],
  },
  {
    id: "slate",
    name: "Modern Slate",
    colors: ["#475569", "#64748B", "#CBD5E1", "#F1F5F9"],
  },
];

const validThemes = themes.map((item) => item.id);

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

export default function SettingPage() {
  const supabase = useMemo(() => createClient(), []);
  const fileRef = useRef<HTMLInputElement>(null);

  const [dark, setDark] = useState(false);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [theme, setTheme] = useState("purple");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (validThemes.includes(theme)) {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        toast.error("Sesi akun tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, theme")
        .eq("id", user.id)
        .single();

      if (!active) return;

      if (error) {
        console.error(error);
        toast.error("Data profil gagal dimuat.");
      } else {
        setName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setAvatar(data.avatar_url ?? null);
        setAvatarChanged(false);
        setTheme(
          validThemes.includes(data.theme ?? "")
            ? (data.theme ?? "purple")
            : "purple",
        );
      }

      setLoading(false);
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [supabase]);

  const card = dark
    ? "border-[#33334b] bg-[#202033] text-white"
    : "border-gray-200 bg-white text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const field = dark
    ? "border-[#44445c] bg-[#292940] text-white"
    : "border-gray-200 bg-white text-gray-800";

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      toast.warning("Nama lengkap wajib diisi.");
      return;
    }

    if (!userId) {
      toast.error("ID pengguna tidak ditemukan. Silakan login kembali.");
      return;
    }

    setSaving(true);

    try {
      let avatarUrlToSave = avatar;

      // Jika pengguna memilih foto baru
      if (avatarChanged && pendingAvatarFile) {
        setUploading(true);

        // Gunakan satu nama file tetap per pengguna
        const path = `${userId}/avatar`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, pendingAvatarFile, {
            contentType: pendingAvatarFile.type,
            upsert: true,
            cacheControl: "0",
          });

        if (uploadError) {
          console.error("Upload avatar gagal:", uploadError);
          toast.error(`Foto gagal diunggah: ${uploadError.message}`);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        avatarUrlToSave = `${publicData.publicUrl}?v=${Date.now()}`;
      }

      // Simpan profil dan URL avatar ke database
      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          phone: trimmedPhone || null,
          ...(avatarChanged ? { avatar_url: avatarUrlToSave } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("Gagal menyimpan profil:", error);
        toast.error(`Profil gagal disimpan: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error("Tidak ada data profil yang diperbarui.");
        return;
      }

      // Perbarui tampilan setelah database berhasil disimpan
      setName(trimmedName);
      setAvatar(avatarUrlToSave);
      setAvatarChanged(false);
      setPendingAvatarFile(null);

      window.dispatchEvent(
        new CustomEvent("edusmart-profile-updated", {
          detail: {
            fullName: trimmedName,
            avatarUrl: avatarUrlToSave,
          },
        }),
      );

      // Bersihkan file avatar lama milik pengguna
      const { data: files, error: listError } = await supabase.storage
        .from("avatars")
        .list(userId);

      if (listError) {
        console.error("Gagal memeriksa avatar lama:", listError);
        toast.warning(
          "Profil tersimpan, tetapi file lama belum dapat diperiksa.",
        );
        return;
      }

      const filesToDelete = (files ?? [])
        .filter((item) => {
          if (!item.id) return false;

          // Jika menggunakan foto, pertahankan hanya file avatar
          if (pendingAvatarFile) {
            return item.name !== "avatar";
          }

          // Jika menggunakan avatar emoji, hapus seluruh foto upload
          if (avatarChanged && avatarUrlToSave?.startsWith("preset:")) {
            return true;
          }

          return false;
        })
        .map((item) => `${userId}/${item.name}`);

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove(filesToDelete);

        if (deleteError) {
          console.error("Gagal menghapus avatar lama:", deleteError);
          toast.warning(
            "Profil tersimpan, tetapi sebagian foto lama belum terhapus.",
          );
          return;
        }
      }

      toast.success("Profil berhasil diperbarui.");
    } catch (error) {
      console.error("Kesalahan menyimpan profil:", error);
      toast.error("Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setUploading(false);
      setSaving(false);
    }
  }

  function chooseAvatar(id: string) {
    const value = `preset:${id}`;
    setAvatar(value);
    setAvatarChanged(true);
    setPendingAvatarFile(null);
  }

  function uploadAvatar(file?: File) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.warning("Gunakan file JPG, PNG, atau WebP.");
      return;
    }

    // Bucket avatars saat ini membatasi ukuran maksimal 500 kb.
    if (file.size > 500000) {
      toast.warning("Ukuran foto maksimal 500 KB.");
      return;
    }

    setPendingAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
    setAvatarChanged(true);
  }

  async function saveTheme(id: string) {
    if (!validThemes.includes(id)) {
      toast.error("Pilihan tema tidak valid.");
      return;
    }

    // Terapkan tema langsung ke seluruh halaman
    setTheme(id);

    // Simpan preferensi tema ke Supabase
    const { error } = await supabase
      .from("profiles")
      .update({
        theme: id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error(error);
      toast.error("Tema gagal disimpan ke akun.");
    } else {
      toast.success("Tema berhasil diterapkan dan disimpan.");
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning("Lengkapi semua kolom password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.warning("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning("Konfirmasi password belum cocok.");
      return;
    }
    if (newPassword === currentPassword) {
      toast.warning("Password baru harus berbeda.");
      return;
    }

    setSavingPassword(true);

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (verifyError) {
      toast.error("Password saat ini tidak sesuai.");
      setSavingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error(error);
      toast.error("Password gagal diperbarui.");
    } else {
      toast.success("Password berhasil diperbarui.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setSavingPassword(false);
  }

  const avatarEmoji = avatar?.startsWith("preset:")
    ? avatars.find(([id]) => id === avatar.slice(7))?.[1]
    : null;

  return (
    <DashboardLayout dark={dark} setDark={setDark}>
      <main className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <header>
            <p className="mb-2 text-sm font-semibold text-violet-600">
              ACCOUNT PREFERENCES
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">Pengaturan Akun</h1>
            <p className={`mt-2 text-sm ${muted}`}>
              Kelola profil, keamanan, dan tampilan Edusmart.
            </p>
          </header>

          {loading ? (
            <div className={`rounded-2xl border p-8 text-center ${card}`}>
              Memuat pengaturan akun...
            </div>
          ) : (
            <>
              <form
                onSubmit={saveProfile}
                className={`rounded-2xl border p-5 sm:p-7 ${card}`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <UserRound className="text-violet-500" />
                  <div>
                    <h2 className="font-bold">Profil Pengguna</h2>
                    <p className={`text-xs ${muted}`}>
                      Informasi dasar akun Edusmart.
                    </p>
                  </div>
                </div>

                <p className="mb-3 text-sm font-semibold">Foto Profil</p>
                <div className="mb-6 flex items-center gap-5">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-violet-100 bg-violet-50 text-5xl">
                    {avatarEmoji ? (
                      avatarEmoji
                    ) : avatar ? (
                      <img
                        src={avatar}
                        alt="Foto profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound size={38} className="text-violet-400" />
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                      <Upload size={16} />{" "}
                      {uploading ? "Mengunggah..." : "Upload Foto"}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        void uploadAvatar(event.target.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                    />
                    <p className={`mt-2 text-xs ${muted}`}>
                      JPG, PNG, WebP · Maksimal 500 KB
                    </p>
                  </div>
                </div>

                <p className="mb-3 text-sm font-semibold">
                  Atau pilih avatar bawaan
                </p>
                <div className="mb-7 grid grid-cols-4 gap-3 sm:grid-cols-8">
                  {avatars.map(([id, emoji]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => void chooseAvatar(id)}
                      aria-label={`Pilih avatar ${id}`}
                      className={`relative flex aspect-square items-center justify-center rounded-2xl border text-3xl transition hover:border-violet-400 ${
                        avatar === `preset:${id}`
                          ? "border-violet-600 bg-violet-50 ring-2 ring-violet-200"
                          : dark
                            ? "border-[#44445c] bg-[#292940]"
                            : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      {emoji}
                      {avatar === `preset:${id}` && (
                        <Check
                          size={14}
                          className="absolute right-1 top-1 text-violet-600"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-semibold">
                    Nama Lengkap
                    <input
                      className={`${inputClass} ${field}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Nama lengkap"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Email
                    <input
                      className={`${inputClass} ${field}`}
                      value={email}
                      readOnly
                      disabled
                    />
                    <span className={`mt-1 block text-xs font-normal ${muted}`}>
                      Email yang sudah terdaftar.
                    </span>
                  </label>
                  <label className="text-sm font-semibold sm:col-span-2">
                    Nomor Telepon
                    <input
                      className={`${inputClass} ${field}`}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      inputMode="tel"
                    />
                  </label>
                </div>

                <div className="mt-6 flex justify-end border-t border-gray-200/70 pt-5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Save size={16} />{" "}
                    {saving ? "Menyimpan..." : "Simpan Profil"}
                  </button>
                </div>
              </form>

              <form
                onSubmit={changePassword}
                className={`rounded-2xl border p-5 sm:p-7 ${card}`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <ShieldCheck className="text-emerald-500" />
                  <div>
                    <h2 className="font-bold">Keamanan Akun</h2>
                    <p className={`text-xs ${muted}`}>
                      Perbarui password akun kamu.
                    </p>
                  </div>
                </div>

                {[
                  {
                    label: "Password Saat Ini",
                    value: currentPassword,
                    set: setCurrentPassword,
                    show: showCurrent,
                    toggle: setShowCurrent,
                    placeholder: "Masukkan password saat ini",
                  },
                  {
                    label: "Password Baru",
                    value: newPassword,
                    set: setNewPassword,
                    show: showNew,
                    toggle: setShowNew,
                    placeholder: "Masukkan password baru (minimal 8 karakter)",
                  },
                  {
                    label: "Konfirmasi Password Baru",
                    value: confirmPassword,
                    set: setConfirmPassword,
                    show: showConfirm,
                    toggle: setShowConfirm,
                    placeholder: "Masukkan kembali password baru",
                  },
                ].map((item, index) => (
                  <label
                    key={item.label}
                    className="mb-4 block text-sm font-semibold"
                  >
                    {item.label}
                    <span className="relative block text-sm font-base">
                      <input
                        className={`${inputClass} ${field} pr-12}`}
                        type={item.show ? "text" : "password"}
                        value={item.value}
                        onChange={(e) => item.set(e.target.value)}
                        placeholder={item.placeholder}
                        autoComplete={
                          index === 0 ? "current-password" : "new-password"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => item.toggle(!item.show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        aria-label="Tampilkan atau sembunyikan password"
                      >
                        {item.show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </span>
                  </label>
                ))}

                <p className={`mb-4 text-xs ${muted}`}>
                  Password baru minimal 8 karakter.
                </p>
                <div className="flex justify-end border-t border-gray-200/70 pt-5">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {savingPassword ? "Memproses..." : "Ubah Password"}
                  </button>
                </div>
              </form>

              <section className={`rounded-2xl border p-5 sm:p-7 ${card}`}>
                <div className="mb-6 flex items-center gap-3">
                  <Palette className="text-sky-500" />
                  <div>
                    <h2 className="font-bold">Tema Warna</h2>
                    <p className={`text-xs ${muted}`}>
                      Pilih palet warna akun Edusmart.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {themes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void saveTheme(item.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        theme === item.id
                          ? "border-violet-500 ring-2 ring-violet-100"
                          : dark
                            ? "border-[#44445c]"
                            : "border-gray-200"
                      }`}
                    >
                      <div className="mb-3 flex gap-1.5">
                        {item.colors.map((color) => (
                          <span
                            key={color}
                            className="h-8 flex-1 rounded-lg"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="flex items-center justify-between text-sm font-semibold">
                        {item.name}
                        {theme === item.id && (
                          <Check size={16} className="text-violet-600" />
                        )}
                      </span>
                    </button>
                  ))}
                </div>

                <p className={`mt-4 text-xs leading-5 ${muted}`}>
                  Tema pilihan kamu akan diterapkan ke seluruh halaman Edusmart
                  dan tersimpan pada akun.
                </p>
              </section>
            </>
          )}
        </div>
        <div className="mt-8">
          <AppFooter dark={dark} />
        </div>
      </main>
    </DashboardLayout>
  );
}
