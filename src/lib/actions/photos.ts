"use server";

import { put } from "@vercel/blob";
import { addPropertyPhoto } from "@/lib/actions/properties";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function placeholderUrl(fileName: string, propertyId: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(fileName + propertyId)}/800/600`;
}

export async function uploadPropertyPhoto(formData: FormData) {
  const file = formData.get("file");
  const propertyId = formData.get("propertyId");
  if (!(file instanceof File) || typeof propertyId !== "string") {
    throw new Error("Arquivo ou imóvel inválido");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Imagem maior que 8 MB");
  }
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use JPG, PNG, WebP ou GIF");
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Upload indisponível: configure BLOB_READ_WRITE_TOKEN");
    }
    return addPropertyPhoto(propertyId, placeholderUrl(file.name, propertyId));
  }

  const blob = await put(`properties/${propertyId}/${Date.now()}-${file.name}`, file, {
    access: "public",
    token,
  });
  return addPropertyPhoto(propertyId, blob.url);
}
