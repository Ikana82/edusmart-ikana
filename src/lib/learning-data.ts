export type MaterialType = "video" | "pdf" | "article" | "link";
export type MaterialStatus = "draft" | "published";

export type LearningMaterial = {
  id: number;
  title: string;
  type: MaterialType;
  duration?: string;
  description: string;
  videoUrl?: string;
  contentUrl?: string;
  articleContent?: string;
  status: MaterialStatus;
};

export type LearningModule = {
  id: number;
  title: string;
  materials: LearningMaterial[];
};

export type LearningProgram = {
  id: string;
  title: string;
  category: string;
  description: string;
  modules: LearningModule[];
};

export const STORAGE_KEY = "edusmart_learning_programs";

export const initialPrograms: Record<string, LearningProgram> = {
  "1": {
    id: "1",
    title: "AI Tools Creator",
    category: "AI Tools",
    description:
      "Belajar merancang konsep, menyusun prompt, dan membangun AI Tools sendiri.",
    modules: [
      {
        id: 1,
        title: "Pendahuluan",
        materials: [
          {
            id: 1,
            title:
              "Fondasi Kecerdasan Buatan (AI) dan Langkah Membangun AI Tools",
            type: "video",
            duration: "14:17 Menit",
            description:
              "Mengenal dasar kecerdasan buatan dan tahapan awal membangun AI Tools.",
            status: "published",
          },
          {
            id: 2,
            title: "Panduan Menentukan Ide AI Tools",
            type: "article",
            description:
              "Pelajari cara menemukan masalah, menentukan target pengguna, dan merumuskan ide produk.",
            articleContent: "",
            status: "published",
          },
          {
            id: 3,
            title: "Panduan Membuat Prompt Efektif",
            type: "pdf",
            description: "Materi pendukung untuk menyusun instruksi AI.",
            contentUrl: "",
            status: "published",
          },
          {
            id: 4,
            title: "Referensi Platform AI",
            type: "link",
            description: "Kumpulan tautan platform untuk membangun AI Tools.",
            contentUrl: "",
            status: "published",
          },
        ],
      },
      {
        id: 2,
        title: "Menentukan Ide AI Tools",
        materials: [
          {
            id: 5,
            title: "Menentukan Masalah dan Target Pengguna",
            type: "video",
            duration: "12:30 Menit",
            description:
              "Memahami kebutuhan pengguna sebelum menentukan fitur AI Tools.",
            status: "published",
          },
          {
            id: 6,
            title: "Membuat Blueprint Produk",
            type: "article",
            description: "Menyusun tujuan, input, proses, dan output produk.",
            articleContent: "",
            status: "published",
          },
        ],
      },
      {
        id: 3,
        title: "Menyusun Master Prompt",
        materials: [
          {
            id: 7,
            title: "Struktur Master Prompt",
            type: "video",
            duration: "10:20 Menit",
            description:
              "Mengenal struktur instruksi untuk menghasilkan output AI yang konsisten.",
            status: "published",
          },
        ],
      },
    ],
  },

  "2": {
    id: "2",
    title: "GAS Builder Website",
    category: "Website",
    description: "Belajar membangun website menggunakan Google Apps Script.",
    modules: [
      {
        id: 1,
        title: "Pengenalan Google Apps Script",
        materials: [
          {
            id: 1,
            title: "Mengenal Google Apps Script",
            type: "video",
            duration: "12:00 Menit",
            description: "Pengenalan dasar Google Apps Script.",
            status: "published",
          },
        ],
      },
    ],
  },

  "3": {
    id: "3",
    title: "Worksheet Builder with Canva",
    category: "Canva",
    description: "Belajar merancang worksheet edukasi anak menggunakan Canva.",
    modules: [
      {
        id: 1,
        title: "Dasar Perencanaan Worksheet",
        materials: [
          {
            id: 1,
            title: "Menentukan Ide Worksheet",
            type: "video",
            duration: "10:00 Menit",
            description: "Mengenal cara merancang ide worksheet edukasi.",
            status: "published",
          },
        ],
      },
    ],
  },
};

export function readLearningPrograms(): Record<string, LearningProgram> {
  if (typeof window === "undefined") {
    return initialPrograms;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved) as Record<string, LearningProgram>;
    }
  } catch (error) {
    console.error("Gagal membaca data LMS:", error);
  }

  return initialPrograms;
}

export function saveLearningPrograms(
  programs: Record<string, LearningProgram>,
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
}
