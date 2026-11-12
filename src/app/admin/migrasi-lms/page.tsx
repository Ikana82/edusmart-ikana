"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { migrateLearningData } from "@/lib/migrate-learning-data";

export default function MigrasiLMSPage() {
  const router = useRouter();

  const [accessStatus, setAccessStatus] = useState<
    "checking" | "allowed" | "denied"
  >("checking");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // MEMERIKSA HAK AKSES ADMIN
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
        router.replace("/");
        return;
      }

      setAccessStatus("allowed");
    }

    checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // MENJALANKAN MIGRASI
  async function handleMigration() {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin memindahkan data LMS ke Supabase?",
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    try {
      const result = await migrateLearningData();
      setMessage(result.message);
    } catch (error) {
      console.error("Migrasi gagal:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Migrasi gagal. Periksa Console.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (accessStatus !== "allowed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <p className="text-sm text-gray-500">Memeriksa hak akses...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] p-8">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#25263a]">Migrasi Data LMS</h1>

        <p className="mt-3 text-sm text-gray-500">
          Pindahkan data kelas, modul, dan materi dari penyimpanan lama ke
          Supabase.
        </p>

        <button
          onClick={handleMigration}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-violet-600 px-5 py-4 font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Sedang Memindahkan Data..." : "Mulai Migrasi LMS"}
        </button>

        {message && (
          <div className="mt-5 rounded-xl bg-violet-50 p-4 text-sm text-violet-700">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
