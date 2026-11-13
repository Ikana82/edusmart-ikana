import { createClient } from "@/lib/supabase/client";
import type {
  LearningModule,
  LearningProgram,
  MaterialStatus,
  MaterialType,
} from "@/lib/learning-data";

type ProgramRow = {
  id: string;
  title: string;
  category: string;
  description: string;
};

type ModuleRow = {
  id: string;
  program_id: string;
  title: string;
  position: number | null;
};

type MaterialRow = {
  id: string;
  module_id: string;
  title: string;
  type: MaterialType;
  duration: string | null;
  description: string;
  video_url: string | null;
  content_url: string | null;
  article_content: string | null;
  status: MaterialStatus;
  position: number | null;
};

export async function loadLmsPrograms(options?: {
  publishedOnly?: boolean;
}): Promise<{ programs: Record<string, LearningProgram>; error?: string }> {
  const supabase = createClient();
  const { data: programRows, error: programError } = await supabase
    .from("lms_programs")
    .select("id,title,category,description")
    .order("title");

  if (programError) return { programs: {}, error: programError.message };

  const { data: moduleRows, error: moduleError } = await supabase
    .from("lms_modules")
    .select("id,program_id,title,position")
    .order("position")
    .order("title");

  if (moduleError) return { programs: {}, error: moduleError.message };

  let materialQuery = supabase
    .from("lms_materials")
    .select(
      "id,module_id,title,type,duration,description,video_url,content_url,article_content,status,position",
    )
    .order("position")
    .order("title");

  if (options?.publishedOnly) materialQuery = materialQuery.eq("status", "published");

  const { data: materialRows, error: materialError } = await materialQuery;
  if (materialError) return { programs: {}, error: materialError.message };

  const modulesByProgram = new Map<string, LearningModule[]>();
  (moduleRows as ModuleRow[]).forEach((row) => {
    const list = modulesByProgram.get(row.program_id) ?? [];
    list.push({ id: row.id, title: row.title, materials: [] });
    modulesByProgram.set(row.program_id, list);
  });

  const modulesById = new Map<string, LearningModule>();
  (moduleRows as ModuleRow[]).forEach((row) => {
    const moduleItem = modulesByProgram
      .get(row.program_id)
      ?.find((item) => item.id === row.id);
    if (moduleItem) {
      modulesById.set(row.id, moduleItem);
    }
  });

  (materialRows as MaterialRow[]).forEach((row) => {
    modulesById.get(row.module_id)?.materials.push({
      id: row.id,
      title: row.title,
      type: row.type,
      duration: row.duration ?? undefined,
      description: row.description ?? "",
      videoUrl: row.video_url ?? undefined,
      contentUrl: row.content_url ?? undefined,
      articleContent: row.article_content ?? undefined,
      status: row.status,
    });
  });

  const programs: Record<string, LearningProgram> = {};
  (programRows as ProgramRow[]).forEach((row) => {
    programs[row.id] = {
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description ?? "",
      modules: modulesByProgram.get(row.id) ?? [],
    };
  });
  return { programs };
}

export async function createLmsProgram(input: {
  title: string;
  category: string;
  description: string;
}) {
  const { data, error } = await createClient()
    .from("lms_programs")
    .insert(input)
    .select("id,title,category,description")
    .single();
  return { data: data as ProgramRow | null, error };
}

export async function updateLmsProgram(
  id: string,
  input: { title: string; category: string; description: string },
) {
  const { data, error } = await createClient()
    .from("lms_programs")
    .update(input)
    .eq("id", id)
    .select("id,title,category,description")
    .single();
  return { data: data as ProgramRow | null, error };
}

export async function deleteLmsProgram(id: string) {
  const supabase = createClient();
  const { data: modules, error: moduleError } = await supabase
    .from("lms_modules")
    .select("id")
    .eq("program_id", id);
  if (moduleError) return { error: moduleError };

  const moduleIds = (modules ?? []).map((module) => module.id);
  if (moduleIds.length) {
    const { error } = await supabase.from("lms_materials").delete().in("module_id", moduleIds);
    if (error) return { error };
    const { error: deleteModulesError } = await supabase.from("lms_modules").delete().eq("program_id", id);
    if (deleteModulesError) return { error: deleteModulesError };
  }
  const { error } = await supabase.from("lms_programs").delete().eq("id", id);
  return { error };
}

export type { ProgramRow, ModuleRow, MaterialRow };
