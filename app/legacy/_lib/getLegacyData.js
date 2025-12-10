'use server';

import { categorias as legacyCategories } from "../../../react-quiosco/src/data/categorias";
import { productos as legacyProducts } from "../../../react-quiosco/src/data/productos";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const FALLBACK_ICON = "/legacy/img/logo.svg";
const FALLBACK_IMAGE = "/legacy/img/logo.svg";

const iconMap = [
  { keyword: "cafe", icon: "/legacy/img/icono_cafe.svg" },
  { keyword: "hamburguesa", icon: "/legacy/img/icono_hamburguesa.svg" },
  { keyword: "pizza", icon: "/legacy/img/icono_pizza.svg" },
  { keyword: "dona", icon: "/legacy/img/icono_dona.svg" },
  { keyword: "pastel", icon: "/legacy/img/icono_pastel.svg" },
  { keyword: "galleta", icon: "/legacy/img/icono_galletas.svg" }
];

function legacyCategoriesFallback() {
  return legacyCategories.map((cat) => ({
    id: cat.id,
    name: cat.nombre,
    icon: `/legacy/img/icono_${cat.icono}.svg`
  }));
}

function legacyProductsFallback() {
  return legacyProducts.map((product) => ({
    id: product.id,
    name: product.nombre,
    price: product.precio,
    categoryId: product.categoria_id,
    image: `/legacy/img/${product.imagen}.jpg`
  }));
}

function pickIcon(name) {
  const normalized = (name || "").toLowerCase();
  const match = iconMap.find(({ keyword }) => normalized.includes(keyword));
  return match ? match.icon : FALLBACK_ICON;
}

function parseSupabaseError(error) {
  if (!error) return null;
  return error instanceof Error ? error.message : String(error);
}

async function fetchFromSupabase(path) {
  if (!supabaseUrl || !supabaseKey) {
    return {
      data: null,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY"
    };
  }

  try {
    const res = await fetch(`${supabaseUrl}${path}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!res.ok) {
      const detail = await res.text();
      return {
        data: null,
        error: `Supabase respondió ${res.status}: ${detail || res.statusText}`
      };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: parseSupabaseError(error) };
  }
}

export async function fetchLegacyCategories() {
  const { data, error } = await fetchFromSupabase(
    "/rest/v1/categories?select=*&order=sort_order.nullsfirst"
  );

  if (error || !Array.isArray(data)) {
    return { data: null, error: error || "Categorías vacías" };
  }

  const categories = data.map((category) => ({
    id: category.id,
    name: category.name ?? "Sin nombre",
    icon: pickIcon(category.name)
  }));

  return { data: categories, error: null };
}

export async function fetchLegacyProducts() {
  const { data, error } = await fetchFromSupabase(
    "/rest/v1/products?select=*&is_available=eq.true&order=created_at.desc"
  );

  if (error || !Array.isArray(data)) {
    return { data: null, error: error || "Productos vacíos" };
  }

  const products = data.map((product) => {
    const priceCents = Number(product.price_cents ?? 0);
    return {
      id: product.id,
      name: product.name ?? "Producto sin nombre",
      price: Number.isFinite(priceCents) ? priceCents / 100 : 0,
      categoryId: product.category_id,
      image: product.image_url || FALLBACK_IMAGE
    };
  });

  return { data: products, error: null };
}

export async function getLegacyData() {
  const [categoriesResult, productsResult] = await Promise.all([
    fetchLegacyCategories(),
    fetchLegacyProducts()
  ]);

  const categoriesBase =
    categoriesResult.data?.length > 0
      ? categoriesResult.data
      : legacyCategoriesFallback();

  const products =
    productsResult.data?.length > 0
      ? productsResult.data
      : legacyProductsFallback();

  const firstProductByCategory = new Map();
  products.forEach((product) => {
    if (product.categoryId && product.image) {
      if (!firstProductByCategory.has(product.categoryId)) {
        firstProductByCategory.set(product.categoryId, product.image);
      }
    }
  });

  const categories = categoriesBase.map((cat) => {
    const productImage = firstProductByCategory.get(cat.id);
    return {
      ...cat,
      icon: productImage || cat.icon
    };
  });

  return { categories, products };
}
