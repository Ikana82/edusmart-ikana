import { createClient } from "@/lib/supabase/client";
import type {
  LearningMaterial,
  LearningProgram,
  MaterialStatus,
  MaterialType,
} from "@/lib/learning-data";

type LoadLmsProgramsOptions = {
  publishedOnly?: boolean;
};

type LmsProgramRow = {
  id: string;
  title: string;
  category: string;
  description: string | null;
};

type LmsModuleRow = {
  id: string | number;
  program_id: string;
  title: string;
};

type LmsMaterialRow = {
  id: string | number;
  module_id: string | number;
  title: string;
  type: MaterialType;
  duration: string | null;
  description: string;
  video_url: string | null;
  content_url: string | null;
  article_content: string | null;
  status: MaterialStatus;
};

export type LmsProgramsResult = {
  error: string | null;
  programs: Record<string, LearningProgram>;
};

export async function loadLmsPrograms(
  options: LoadLmsProgramsOptions = {},
): Promise<LmsProgramsResult> {
  const supabase = createClient();

  const { data: rawProgramRows, error: programError } = await supabase
    .from("lms_programs")
    .select("*");

  if (programError) {
    return {
      error: programError.message,
      programs: {},
    };
  }

  const programRows = (rawProgramRows ?? []) as LmsProgramRow[];

  if (programRows.length === 0) {
    return {
      error: null,
      programs: {},
    };
  }

  const programIds = programRows.map((program) => program.id);

  const { data: rawModuleRows, error: moduleError } = await supabase
    .from("lms_modules")
    .select("*")
    .in("program_id", programIds);

  if (moduleError) {
    return {
      error: moduleError.message,
      programs: {},
    };
  }

  const modules = (rawModuleRows ?? []) as LmsModuleRow[];
  const moduleIds = modules.map((module) => module.id);

  let materialRows: LmsMaterialRow[] = [];

  if (moduleIds.length > 0) {
    const { data: rawMaterialRows, error } = await supabase
      .from("lms_materials")
      .select("*")
      .in("module_id", moduleIds);

    if (error) {
      return {
        error: error.message,
        programs: {},
      };
    }

    materialRows = (rawMaterialRows ?? []) as LmsMaterialRow[];
  }

  const programs = Object.fromEntries(
    programRows.map((program) => [
      String(program.id),
      {
        id: String(program.id),
        title: program.title,
        category: program.category,
        description: program.description ?? "",
        modules: modules
          .filter((module) => module.program_id === program.id)
          .map((module) => ({
            id: module.id,
            title: module.title,
            materials: materialRows
              .filter(
                (material) =>
                  material.module_id === module.id &&
                  (!options.publishedOnly || material.status === "published"),
              )
              .map(
                (material): LearningMaterial => ({
                  id: material.id,
                  title: material.title,
                  type: material.type,
                  duration: material.duration ?? undefined,
                  description: material.description,
                  videoUrl: material.video_url ?? undefined,
                  contentUrl: material.content_url ?? undefined,
                  articleContent: material.article_content ?? undefined,
                  status: material.status,
                }),
              ),
          })),
      },
    ]),
  ) as Record<string, LearningProgram>;

  return {
    error: null,
    programs,
  };
}

export async function createLmsProgram(payload: {
  title: string;
  category: string;
  description?: string;
}) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("lms_programs")
    .insert({
      id: crypto.randomUUID(),
      title: payload.title,
      category: payload.category,
      description: payload.description ?? "",
    })
    .select("*")
    .single();

  return {
    data,
    error,
  };
}

// ---- FETCHING CATEGORIES ----
export async function loadLmsCategories() {
  const supabase = createClient();
  const { data, error } = await supabase.from("lms_categories").select("*");
  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function createLmsCategory(payload: Record<string, unknown>) {
  const supabase = createClient();
  const { error } = await supabase.from("lms_categories").insert([payload]);
  if (error) throw new Error(error.message);
  return true;
}

export async function updateLmsCategory(
  id: string | number,
  payload: Record<string, unknown>,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lms_categories")
    .update(payload)
    .eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function deleteLmsCategory(id: string | number) {
  const supabase = createClient();
  const { error } = await supabase.from("lms_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

// ---- FETCHING SPECIFIC PROGRAM ----
export async function loadLmsProgramById(id: string) {
  const supabase = createClient();

  // Contoh query dengan relasi, sesuaikan nama kolom relasi dengan skema database-mu
  const { data, error } = await supabase
    .from("lms_programs")
    .select(
      `
      *,
      modules:lms_modules(
        *,
        materials:lms_materials(*)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) return { error: error.message, data: null };

  // (Jika perlu parsing tambahan sesuai skema `loadLmsPrograms` mu, lakukan di sini)
  return { data, error: null };
}

// ---- MODULES CRUD ----
export async function createLmsModule(
  programId: string,
  payload: Record<string, unknown>,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lms_modules")
    .insert([{ ...payload, program_id: programId }]);
  if (error) throw new Error(error.message);
  return true;
}

export async function updateLmsModule(
  moduleId: string,
  programId: string,
  payload: Record<string, unknown>,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lms_modules")
    .update(payload)
    .eq("id", moduleId)
    .eq("program_id", programId);
  if (error) throw new Error(error.message);
  return true;
}

export async function deleteLmsModule(moduleId: string, programId: string) {
  const supabase = createClient();
  // Jika database-mu tidak mensetting CASCADE DELETE, hapus materi terlebih dahulu.
  await supabase.from("lms_materials").delete().eq("module_id", moduleId);

  const { error } = await supabase
    .from("lms_modules")
    .delete()
    .eq("id", moduleId)
    .eq("program_id", programId);
  if (error) throw new Error(error.message);
  return true;
}

// ---- MATERIALS CRUD ----
export async function createLmsMaterial(payload: Record<string, unknown>) {
  const supabase = createClient();
  const { error } = await supabase.from("lms_materials").insert([payload]);
  if (error) throw new Error(error.message);
  return true;
}

export async function updateLmsMaterial(
  materialId: string,
  moduleId: string,
  payload: Record<string, unknown>,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lms_materials")
    .update(payload)
    .eq("id", materialId)
    .eq("module_id", moduleId);
  if (error) throw new Error(error.message);
  return true;
}

export async function deleteLmsMaterial(materialId: string, moduleId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lms_materials")
    .delete()
    .eq("id", materialId)
    .eq("module_id", moduleId);
  if (error) throw new Error(error.message);
  return true;
}
