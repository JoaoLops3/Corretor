"use server";

import { put } from "@vercel/blob";
import { addPropertyPhoto } from "@/lib/actions/properties";

function placeholderUrl(fileName: string, propertyId: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(fileName + propertyId)}/800/600`;
}

export async function uploadPropertyPhoto(formData: FormData) {
  const file = formData.get("file");
  const propertyId = formData.get("propertyId");
  if (!(file instanceof File) || typeof propertyId !== "string") {
    throw new Error("Arquivo ou imóvel inválido");
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return addPropertyPhoto(propertyId, placeholderUrl(file.name, propertyId));
  }

  const blob = await put(`properties/${propertyId}/${Date.now()}-${file.name}`, file, {
    access: "public",
    token,
  });
  return addPropertyPhoto(propertyId, blob.url);
}
