const FALLBACK_PRODUCTS = [
  {
    id: "demo-1",
    name: "Combo Clásico",
    description: "Hamburguesa, papas y bebida",
    price_cents: 12000,
    category: "Combos",
    image_url: "https://via.placeholder.com/320x180"
  },
  {
    id: "demo-2",
    name: "Hamburguesa Doble",
    description: "Doble carne, queso y vegetales frescos",
    price_cents: 13500,
    category: "Hamburguesas",
    image_url: "https://via.placeholder.com/320x180"
  },
  {
    id: "demo-3",
    name: "Papas Gajo",
    description: "Papas sazonadas estilo gajo",
    price_cents: 6500,
    category: "Snacks",
    image_url: "https://via.placeholder.com/320x180"
  },
  {
    id: "demo-4",
    name: "Refresco Grande",
    description: "Bebida carbonatada 600ml",
    price_cents: 3500,
    category: "Bebidas",
    image_url: "https://via.placeholder.com/320x180"
  }
];

export async function getProducts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return {
      data: FALLBACK_PRODUCTS,
      error:
        "Faltan variables NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY",
      fromSupabase: false
    };
  }

  const endpoint = `${url}/rest/v1/products?select=*`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        data: FALLBACK_PRODUCTS,
        error: `Supabase respondió ${res.status}: ${text}`,
        fromSupabase: false
      };
    }

    const data = await res.json();
    return { data, error: null, fromSupabase: true };
  } catch (error) {
    return {
      data: FALLBACK_PRODUCTS,
      error: error instanceof Error ? error.message : String(error),
      fromSupabase: false
    };
  }
}

export { FALLBACK_PRODUCTS };
