export type VideoSource =
  | { kind: "youtube" | "google-drive" | "direct"; url: string }
  | { kind: "invalid"; reason: string };

function getYouTubeId(url: URL) {
  if (url.hostname === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] ?? null;
  }

  if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com" || url.hostname === "m.youtube.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length === 2 && (segments[0] === "embed" || segments[0] === "shorts")) return segments[1];
  }

  return null;
}

function getGoogleDriveId(url: URL) {
  const fileMatch = url.pathname.match(/^\/file\/d\/([^/]+)/);
  return fileMatch?.[1] ?? url.searchParams.get("id");
}

export function getVideoSource(value: string): VideoSource {
  const trimmed = value.trim();
  if (!trimmed) return { kind: "invalid", reason: "URL video belum diisi." };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { kind: "invalid", reason: "URL video tidak valid." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { kind: "invalid", reason: "URL video harus menggunakan HTTP atau HTTPS." };
  }

  const hostname = url.hostname.toLowerCase();
  const youtubeId = getYouTubeId(url);
  if (youtubeId && /^[\w-]{6,}$/.test(youtubeId)) {
    return { kind: "youtube", url: `https://www.youtube.com/embed/${youtubeId}` };
  }

  if (hostname === "drive.google.com" || hostname === "www.drive.google.com") {
    const fileId = getGoogleDriveId(url);
    if (fileId) return { kind: "google-drive", url: `https://drive.google.com/file/d/${fileId}/preview` };
    return { kind: "invalid", reason: "URL Google Drive tidak memiliki ID file yang valid." };
  }

  if (/\.(mp4|webm|ogg|m4v|mov)(?:$|[?#])/i.test(url.pathname + url.search)) {
    return { kind: "direct", url: url.toString() };
  }

  return { kind: "invalid", reason: "Format video belum didukung. Gunakan YouTube, Google Drive, MP4, WebM, atau OGG." };
}
