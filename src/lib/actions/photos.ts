"use server";

import { put } from "@vercel/blob";
import { addPropertyPhoto } from "@/lib/actions/properties";

export async function uploadPropertyPhoto(formData: FormData) {
  const file = formData.get("file");
  const propertyId = formData.get("propertyId");
  if (!(file instanceof File) || typeof propertyId !== "string") {
    throw new Error("Arquivo ou imóvel inválido");
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    // Sem Blob: placeholder estável por nome
    const url = `https://picsum.photos/seed/${encodeURIComponent(file.name + propertyId)}/800/600`;
    return addPropertyPhoto(propertyId, url);
  }

  const blob = await put(`properties/${propertyId}/${Date.now()}-${file.name}`, file, {
    access: "public",
    token,
  });
  return addPropertyPhoto(propertyId, blob.url);
}
