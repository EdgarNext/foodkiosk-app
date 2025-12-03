const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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
    ...extra,
  };
}

async function parseResponse(res) {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "object" ? JSON.stringify(parsed) : parsed;
  } catch {
    return text;
  }
}

export function getSupabaseStatus() {
  return {
    hasConfig: Boolean(supabaseUrl && supabaseKey),
    supabaseUrl,
    bucketName,
  };
}

export async function fetchCategories() {
  if (!supabaseUrl || !supabaseKey) {
    return { data: [], error: missingConfigError() };
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/categories?select=*&order=sort_order`,
      {
        headers: defaultHeaders({ Accept: "application/json" }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const detail = await parseResponse(res);
      return {
        data: [],
        error: `Supabase respondió ${res.status}: ${detail}`,
      };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function fetchProducts() {
  if (!supabaseUrl || !supabaseKey) {
    return { data: [], error: missingConfigError() };
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/products?select=*,categories(name)&order=created_at.desc`,
      {
        headers: defaultHeaders({ Accept: "application/json" }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const detail = await parseResponse(res);
      return {
        data: [],
        error: `Supabase respondió ${res.status}: ${detail}`,
      };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function deleteCategory(categoryId) {
  if (!supabaseUrl || !supabaseKey) {
    return { error: missingConfigError() };
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/categories?id=eq.${encodeURIComponent(
        categoryId
      )}`,
      {
        method: "DELETE",
        headers: defaultHeaders({
          Accept: "application/json",
          Prefer: "return=minimal",
        }),
      }
    );

    if (!res.ok) {
      const detail = await parseResponse(res);
      return { error: `Supabase respondió ${res.status}: ${detail}` };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteProduct(productId) {
  if (!supabaseUrl || !supabaseKey) {
    return { error: missingConfigError() };
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/products?id=eq.${encodeURIComponent(
        productId
      )}`,
      {
        method: "DELETE",
        headers: defaultHeaders({
          Accept: "application/json",
          Prefer: "return=minimal",
        }),
      }
    );

    if (!res.ok) {
      const detail = await parseResponse(res);
      return { error: `Supabase respondió ${res.status}: ${detail}` };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function createCategory({ name, description }) {
  if (!supabaseUrl || !supabaseKey) {
    return { data: null, error: missingConfigError() };
  }

  const payload = {
    name,
    description: description || null,
  };

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/categories`, {
      method: "POST",
      headers: defaultHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      }),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await parseResponse(res);
      return {
        data: null,
        error: `Supabase respondió ${res.status}: ${detail}`,
      };
    }

    const data = await res.json();
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function uploadProductImage(file) {
  if (!supabaseUrl || !supabaseKey) {
    return { publicUrl: null, error: missingConfigError() };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
  const objectPath = `products/${Date.now()}-${safeName}`;

  try {
    const res = await fetch(
      `${supabaseUrl}/storage/v1/object/${encodeURIComponent(
        bucketName
      )}/${objectPath}`,
      {
        method: "POST",
        headers: defaultHeaders({
          "Content-Type": file.type || "application/octet-stream",
          Accept: "application/json",
          "x-upsert": "true",
        }),
        body: file,
      }
    );

    if (!res.ok) {
      const detail = await parseResponse(res);
      return {
        publicUrl: null,
        error: `Subida de imagen falló (${res.status}): ${detail}`,
      };
    }

    const uploaded = await res.json();
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${uploaded.Key}`;
    return { publicUrl, error: null };
  } catch (error) {
    return {
      publicUrl: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function createProduct(payload) {
  if (!supabaseUrl || !supabaseKey) {
    return { data: null, error: missingConfigError() };
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/products`, {
      method: "POST",
      headers: defaultHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      }),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await parseResponse(res);
      return {
        data: null,
        error: `Supabase respondió ${res.status}: ${detail}`,
      };
    }

    const data = await res.json();
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
