import { createClient } from "@/lib/supabase/client";
import { readLearningPrograms } from "@/lib/learning-data";

export async function migrateLearningData() {
  const supabase = createClient();
  const programs = readLearningPrograms();

  for (const program of Object.values(programs)) {
    // 1. Simpan program / kelas
    const { error: programError } = await supabase.from("lms_programs").upsert({
      id: program.id,
      title: program.title,
      category: program.category,
      description: program.description,
    });

    if (programError) throw programError;

    for (
      let moduleIndex = 0;
      moduleIndex < program.modules.length;
      moduleIndex++
    ) {
      const module = program.modules[moduleIndex];
      const moduleId = `${program.id}-${module.id}`;

      // 2. Simpan modul
      const { error: moduleError } = await supabase.from("lms_modules").upsert({
        id: moduleId,
        program_id: program.id,
        title: module.title,
        position: moduleIndex,
      });

      if (moduleError) throw moduleError;

      for (
        let materialIndex = 0;
        materialIndex < module.materials.length;
        materialIndex++
      ) {
        const material = module.materials[materialIndex];
        const materialId = `${program.id}-${module.id}-${material.id}`;

        // 3. Simpan materi
        const { error: materialError } = await supabase
          .from("lms_materials")
          .upsert({
            id: materialId,
            module_id: moduleId,
            title: material.title,
            type: material.type,
            duration: material.duration ?? null,
            description: material.description,
            video_url: material.videoUrl ?? null,
            content_url: material.contentUrl ?? null,
            article_content: material.articleContent ?? null,
            status: material.status,
            position: materialIndex,
          });

        if (materialError) throw materialError;
      }
    }
  }

  return {
    success: true,
    message: "Data LMS berhasil dipindahkan ke Supabase.",
  };
}
