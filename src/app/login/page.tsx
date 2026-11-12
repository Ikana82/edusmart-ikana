"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  BookOpen,
  LockKeyhole,
  Mail,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email atau password tidak sesuai. Silakan periksa kembali.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-white">
      <div className="grid h-full w-full grid-cols-1 overflow-hidden bg-white lg:grid-cols-2">
        {/* PANEL KIRI - DESKTOP SAJA */}
        <section className="relative hidden h-full min-w-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[#625cff] via-[#7548f5] to-[#9565ff] p-8 text-white lg:flex xl:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-indigo-300/20 blur-2xl" />

          <div className="relative z-10 flex w-full max-w-md flex-col">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold tracking-wide">
              <Sparkles size={15} />
              DIGITAL LEARNING PLATFORM
            </div>

            <h1 className="text-3xl font-extrabold leading-tight xl:text-4xl">
              Kembangkan Potensi,
              <br />
              Bangun Masa Depan
              <br />
              Bersama Edusmart!
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
              Tempat belajar, mengembangkan kreativitas, dan membangun kemampuan
              sebagai digital creator.
            </p>

            {/* ILUSTRASI */}
            <div className="relative mt-7 flex h-44 items-center justify-center">
              <div className="absolute h-40 w-40 rounded-full border border-white/20 bg-white/10" />
              <div className="absolute h-32 w-32 rounded-full border border-white/20" />

              <div className="relative flex h-32 w-52 items-center justify-center rounded-3xl border border-white/30 bg-white/15 shadow-xl backdrop-blur-sm">
                <div className="absolute -top-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-lg">
                  <GraduationCap size={34} />
                </div>

                <div className="mt-9 flex items-center gap-4">
                  <div className="rounded-xl bg-white/20 p-3">
                    <BookOpen size={25} />
                  </div>

                  <div className="rounded-xl bg-white/20 p-3">
                    <Sparkles size={25} />
                  </div>
                </div>
              </div>

              <Sparkles
                className="absolute right-5 top-3 text-yellow-200"
                size={23}
              />

              <Sparkles
                className="absolute bottom-3 left-5 text-white/70"
                size={19}
              />
            </div>

            <p className="mt-5 text-center text-xs font-medium tracking-widest text-white/70">
              LEARN • CREATE • GROW
            </p>
          </div>
        </section>

        {/* PANEL LOGIN */}
        <section className="flex h-full min-h-0 min-w-0 items-center justify-center overflow-y-auto overflow-x-hidden bg-white px-5 sm:px-8 lg:px-10 xl:px-16">
          <div className="my-auto w-full max-w-md py-5">
            {/* LOGO */}
            <div className="mb-5 flex items-center justify-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-200">
                <GraduationCap size={25} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#292641]">
                  Edusmart
                </h2>
                <p className="text-xs text-gray-500">by Ikanuraisma</p>
              </div>
            </div>

            {/* JUDUL */}
            <div className="mb-5 text-center">
              <h3 className="text-2xl font-extrabold tracking-tight text-[#242238] sm:text-3xl">
                Welcome Back!
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Silakan login untuk masuk ke akun kamu.
              </p>
            </div>

            {/* FORM LOGIN */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">
                  Email Address
                </label>

                <div className="flex items-center rounded-xl border border-gray-200 bg-[#f7f7fa] px-4 transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
                  <Mail size={18} className="shrink-0 text-gray-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email kamu"
                    required
                    autoComplete="email"
                    className="h-12 w-full bg-transparent px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600">
                  Password
                </label>

                <div className="flex items-center rounded-xl border border-gray-200 bg-[#f7f7fa] px-4 transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
                  <LockKeyhole size={18} className="shrink-0 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    autoComplete="current-password"
                    className="h-12 w-full bg-transparent px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    className="text-gray-400 transition hover:text-violet-600"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* TOMBOL LOGIN */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* FOOTER */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-xs text-gray-400">
                Edusmart Learning Platform
              </span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <p className="text-center text-xs leading-relaxed text-gray-400">
              Dengan masuk, kamu dapat melanjutkan pembelajaran dan mengakses
              fasilitas Edusmart.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
