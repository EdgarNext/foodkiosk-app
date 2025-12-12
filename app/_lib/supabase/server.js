import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        try {
          return typeof cookieStore?.getAll === "function"
            ? cookieStore.getAll()
            : [];
        } catch {
          return [];
        }
      },
      setAll(cookiesToSet) {
        try {
          if (typeof cookieStore?.set === "function") {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          }
        } catch {
          // ignore if not available in this context
        }
      },
    },
  });
}
