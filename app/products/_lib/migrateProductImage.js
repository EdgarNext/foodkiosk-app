'use server';

import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName =
  process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET || "product-images";

function missingConfigError() {
  return "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY";
}

function defaultHeaders(extra = {}) {
  if (!supabaseKey) return extra;

  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    ...extra
  };
}

function safeExtension(contentType, fallback = ".jpg") {
  if (!contentType) return fallback;
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("svg")) return ".svg";
  return fallback;
}

function safeName(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .trim();
}

export async function migrateProductImage(formData) {
  const id = formData.get("id");
  const imageUrl = formData.get("image_url");
  const name = formData.get("name") || "producto";

  if (!id) return { error: "Falta id de producto." };
  if (!imageUrl) return { error: "El producto no tiene image_url." };
  if (!supabaseUrl || !supabaseKey) return { error: missingConfigError() };

  // 1) Descargar imagen original
  let arrayBuffer;
  let contentType = "application/octet-stream";

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return {
        error: `No se pudo leer la imagen (${res.status} ${res.statusText})`
      };
    }
    contentType = res.headers.get("content-type") || contentType;
    arrayBuffer = await res.arrayBuffer();
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `Error al descargar la imagen: ${error.message}`
          : "Error al descargar la imagen."
    };
  }

  // 2) Subir a Supabase Storage
  const ext = safeExtension(contentType);
  const baseName = safeName(name) || "producto";
  const objectPath = `products/${baseName}-${Date.now()}${ext}`;

  try {
    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${encodeURIComponent(
        bucketName
      )}/${objectPath}`,
      {
        method: "POST",
        headers: defaultHeaders({
          "Content-Type": contentType,
          Accept: "application/json",
          "x-upsert": "true"
        }),
        body: Buffer.from(arrayBuffer)
      }
    );

    if (!uploadRes.ok) {
      const detail = await uploadRes.text();
      return {
        error: `Subida a storage falló (${uploadRes.status}): ${detail}`
      };
    }

    const uploaded = await uploadRes.json();
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${uploaded.Key}`;

    // 3) Actualizar el producto en la tabla
    const patchRes = await fetch(
      `${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: defaultHeaders({
          "Content-Type": "application/json",
          Accept: "application/json",
          Prefer: "return=minimal"
        }),
        body: JSON.stringify({ image_url: publicUrl })
      }
    );

    if (!patchRes.ok) {
      const detail = await patchRes.text();
      return {
        error: `No se pudo actualizar el producto (${patchRes.status}): ${detail}`
      };
    }

    revalidatePath("/products");
    return { error: null, imageUrl: publicUrl };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `Error general: ${error.message}`
          : "Error general al migrar la imagen."
    };
  }
}
